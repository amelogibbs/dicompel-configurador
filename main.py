from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from fastapi.security import HTTPBearer, HTTPAuthCredentials
from pydantic import BaseModel, EmailStr, validator
from typing import Optional, List, Dict
from pathlib import Path
from datetime import datetime, timedelta
from passlib.context import CryptContext
from jose import JWTError, jwt
import os
import logging
import base64
from functools import lru_cache

# ======================== CONFIGURAÇÃO ========================

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# 1. SEGURANÇA - PASSWORD HASHING
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# 2. SEGURANÇA - JWT
security = HTTPBearer()

# 3. DEFINIÇÃO DE CAMINHOS
BASE_DIR = Path(__file__).resolve().parent
frontend_dist = BASE_DIR / "frontend" / "dist"

# 4. WHITELIST DE EXTENSÕES DE ARQUIVO
ALLOWED_FILE_EXTENSIONS = {
    ".js", ".css", ".html", ".png", ".jpg", 
    ".jpeg", ".ico", ".json", ".svg", ".gif", ".webp"
}

# 5. CONFIGURAÇÕES
SECRET_KEY = os.getenv("SECRET_KEY", "dev-key-change-in-production")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:8000").split(",")

# 6. INICIALIZAÇÃO DO APP
app = FastAPI(
    title="API DICOMPEL v2.0",
    description="API Segura com JWT Authentication + Bcrypt",
    version="2.0.0"
)

# 7. CONFIGURAÇÃO DE CORS (Restritivo)
allowed_origins = [origin.strip() for origin in ALLOWED_ORIGINS]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

# ======================== DADOS DE TESTE (Em Memória) ========================

# Hash das senhas de teste (senha123)
TEST_PASSWORD_HASH = pwd_context.hash("senha123")

# Usuários de teste
USERS_DB = {
    "admin@dicompel.com": {
        "id": 1,
        "nome": "Admin DICOMPEL",
        "email": "admin@dicompel.com",
        "senha_hash": TEST_PASSWORD_HASH,
        "perfil": "admin",
        "ativo": True
    },
    "user@dicompel.com": {
        "id": 2,
        "nome": "Usuário Teste",
        "email": "user@dicompel.com",
        "senha_hash": TEST_PASSWORD_HASH,
        "perfil": "user",
        "ativo": True
    }
}

# Produtos de teste
PRODUCTS_DB = [
    {
        "ProductID": 1,
        "ProductCode": "PROD-001",
        "ProductName": "Eletrônico A",
        "Category": "Eletrônicos",
        "Brand": "BrandX",
        "Line": "Premium",
        "TechnicalSpecs": "Specs do produto A",
        "Price": 1500.00,
        "Stock": 50
    },
    {
        "ProductID": 2,
        "ProductCode": "PROD-002",
        "ProductName": "Eletrônico B",
        "Category": "Eletrônicos",
        "Brand": "BrandY",
        "Line": "Standard",
        "TechnicalSpecs": "Specs do produto B",
        "Price": 2500.00,
        "Stock": 30
    },
    {
        "ProductID": 3,
        "ProductCode": "PROD-003",
        "ProductName": "Eletrônico C",
        "Category": "Acessórios",
        "Brand": "BrandZ",
        "Line": "Basic",
        "TechnicalSpecs": "Specs do produto C",
        "Price": 800.00,
        "Stock": 100
    }
]

# Pedidos de teste
ORDERS_DB = [
    {
        "OrderId": 1,
        "OrderNumber": "PED-2026-001",
        "CustomerName": "João Silva",
        "CustomerEmail": "joao@example.com",
        "CustomerPhone": "(11) 99999-0001",
        "RepresentativeID": 1,
        "Region": "São Paulo",
        "Status": "ENTREGUE",
        "CreatedAt": "2026-04-20"
    },
    {
        "OrderId": 2,
        "OrderNumber": "PED-2026-002",
        "CustomerName": "Maria Santos",
        "CustomerEmail": "maria@example.com",
        "CustomerPhone": "(11) 99999-0002",
        "RepresentativeID": 2,
        "Region": "Rio de Janeiro",
        "Status": "PROCESSANDO",
        "CreatedAt": "2026-04-22"
    },
    {
        "OrderId": 3,
        "OrderNumber": "PED-2026-003",
        "CustomerName": "Carlos Costa",
        "CustomerEmail": "carlos@example.com",
        "CustomerPhone": "(11) 99999-0003",
        "RepresentativeID": 1,
        "Region": "Minas Gerais",
        "Status": "PENDENTE",
        "CreatedAt": "2026-04-25"
    }
]

# ======================= MODELOS PYDANTIC =======================

class LoginRequest(BaseModel):
    """Modelo para requisição de login"""
    email: EmailStr
    password: str
    
    @validator('password')
    def password_min_length(cls, v):
        """Validar tamanho mínimo da senha"""
        if len(v) < 6:
            raise ValueError('Senha deve ter no mínimo 6 caracteres')
        return v

class UserResponse(BaseModel):
    """Modelo de resposta de usuário (sem senha)"""
    id: int
    nome: str
    email: str
    perfil: str
    ativo: bool

class LoginResponse(BaseModel):
    """Modelo de resposta de login"""
    success: bool
    token: Optional[str] = None
    user: Optional[UserResponse] = None
    error: Optional[str] = None

class OrderItem(BaseModel):
    productId: str
    productCode: str
    productName: str
    quantity: int
    price: float = 0

class OrderPayload(BaseModel):
    representativeId: str
    userId: int
    items: List[OrderItem]
    status: str = "PENDING"
    totalItems: int
    totalQuantity: int
    createdAt: str

class HealthResponse(BaseModel):
    """Resposta do health check"""
    status: str
    message: str
    timestamp: str
    security: str
    version: str

# ====================== FUNÇÕES DE SEGURANÇA =======================

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verificar senha contra hash bcrypt"""
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except Exception as e:
        logger.warning(f"Erro ao verificar senha: {str(e)}")
        return False

def get_password_hash(password: str) -> str:
    """Gerar hash bcrypt de senha"""
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Criar JWT token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(
        to_encode,
        SECRET_KEY,
        algorithm="HS256"
    )
    return encoded_jwt

async def verify_token(credentials: HTTPAuthCredentials = Depends(security)) -> Dict:
    """Verificar e decodificar JWT token"""
    token = credentials.credentials
    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=["HS256"]
        )
        user_id: int = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token inválido"
            )
        return {"user_id": user_id}
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token expirado ou inválido"
        )

def sanitize_file_path(requested_path: str, base_dir: Path) -> Optional[Path]:
    """
    Sanitizar caminho de arquivo para prevenir directory traversal
    ✅ Proteção contra: /../../../etc/passwd
    """
    try:
        # Converter para Path e resolver (remove ..)
        requested_file = (base_dir / requested_path).resolve()
        
        # Verificar se está dentro do diretório base
        if not str(requested_file).startswith(str(base_dir)):
            logger.warning(f"⚠️ Tentativa de directory traversal: {requested_path}")
            return None
        
        return requested_file
    except Exception as e:
        logger.error(f"Erro ao sanitizar caminho: {str(e)}")
        return None

# ======================= ROTAS DA API =======================

@app.post("/api/login", response_model=LoginResponse)
async def login(data: LoginRequest) -> LoginResponse:
    """
    Endpoint de login - Retorna JWT token
    
    ✅ Valida email com regex
    ✅ Verifica senha com bcrypt
    ✅ Retorna JWT token
    ✅ Sem detalhes sensíveis em caso de erro
    """
    try:
        # Buscar usuário (em memória para teste)
        user_data = USERS_DB.get(data.email)
        
        if not user_data:
            logger.warning(f"⚠️ Tentativa de login com email inexistente: {data.email}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Email ou senha incorretos"
            )
        
        # Verificar senha com bcrypt
        if not verify_password(data.password, user_data["senha_hash"]):
            logger.warning(f"⚠️ Senha incorreta para: {data.email}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Email ou senha incorretos"
            )
        
        # Gerar token
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user_data["id"]},
            expires_delta=access_token_expires
        )
        
        logger.info(f"✅ Login bem-sucedido: {data.email}")
        
        return LoginResponse(
            success=True,
            token=access_token,
            user=UserResponse(
                id=user_data["id"],
                nome=user_data["nome"],
                email=user_data["email"],
                perfil=user_data["perfil"],
                ativo=user_data["ativo"]
            )
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Erro no login: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro ao fazer login"
        )

@app.get("/api/products")
async def get_products(current_user: Dict = Depends(verify_token)):
    """
    Obter lista de produtos - PROTEGIDO
    ✅ Requer token JWT válido
    """
    try:
        return PRODUCTS_DB
    except Exception as e:
        logger.error(f"❌ Erro ao buscar produtos: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro ao buscar produtos"
        )

@app.get("/api/orders")
async def get_orders(current_user: Dict = Depends(verify_token)):
    """
    Obter lista de pedidos - PROTEGIDO
    ✅ Requer token JWT válido
    """
    try:
        return ORDERS_DB
    except Exception as e:
        logger.error(f"❌ Erro ao buscar pedidos: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro ao buscar pedidos"
        )

@app.get("/api/health", response_model=HealthResponse)
async def health() -> HealthResponse:
    """
    Health check - SEM autenticação
    ✅ Público - sem necessidade de token
    """
    return HealthResponse(
        status="ok",
        message="API DICOMPEL v2.0 funcionando",
        timestamp=datetime.now().isoformat(),
        security="JWT + Bcrypt",
        version="2.0.0"
    )

# ====================== SERVIR FRONTEND ======================

if frontend_dist.exists():
    logger.info(f"✅ Frontend encontrado em: {frontend_dist}")
    assets_path = frontend_dist / "assets"
    if assets_path.exists():
        app.mount("/assets", StaticFiles(directory=str(assets_path)), name="assets")
else:
    logger.info(f"⚠️ Pasta frontend/dist não encontrada (usando dados de teste)")

@app.get("/{full_path:path}")
async def serve_frontend(full_path: str):
    """
    Servir frontend - Com proteção contra directory traversal
    ✅ Validação de path
    ✅ Whitelist de extensões
    """
    # Ignorar rotas de API
    if full_path.startswith("api/"):
        raise HTTPException(status_code=404, detail="Rota não encontrada")
    
    # Sanitizar caminho
    file_path = sanitize_file_path(full_path, frontend_dist)
    
    if file_path is None:
        logger.warning(f"⚠️ Acesso negado a: {full_path}")
        raise HTTPException(status_code=403, detail="Acesso negado")
    
    # Validar extensão de arquivo
    if file_path.suffix.lower() not in ALLOWED_FILE_EXTENSIONS and file_path.is_file():
        logger.warning(f"⚠️ Extensão não permitida: {file_path.suffix}")
        raise HTTPException(status_code=403, detail="Tipo de arquivo não permitido")
    
    # Servir arquivo se existir
    if file_path.exists() and file_path.is_file():
        return FileResponse(file_path)
    
    # Servir index.html como fallback (SPA)
    index_path = frontend_dist / "index.html"
    if index_path.exists():
        return FileResponse(index_path)
    
    raise HTTPException(status_code=404, detail="Arquivo não encontrado")

# ==================== EXCEPTION HANDLERS ====================

@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc: HTTPException):
    """Handler customizado para HTTPException"""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": exc.detail,
            "status_code": exc.status_code
        }
    )

# ======================== INICIALIZAÇÃO =======================

if __name__ == "__main__":
    import uvicorn
    
    port = int(os.getenv("PORT", 8000))
    
    logger.info("=" * 60)
    logger.info("🚀 Iniciando API DICOMPEL v2.0")
    logger.info("=" * 60)
    logger.info(f"📍 Host: 0.0.0.0:{port}")
    logger.info(f"🔓 CORS permitidas: {allowed_origins}")
    logger.info(f"📚 Documentação: http://localhost:{port}/docs")
    logger.info("=" * 60)
    logger.info("✅ Usuários de teste:")
    logger.info("   • Email: admin@dicompel.com | Senha: senha123")
    logger.info("   • Email: user@dicompel.com | Senha: senha123")
    logger.info("=" * 60)
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=port,
        log_level=logging.INFO
    )
