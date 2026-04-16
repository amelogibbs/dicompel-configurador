from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import Optional, List
from pathlib import Path
import os
import logging
import datetime

# 1. CONFIGURAÇÃO DE LOGGING
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 2. DEFINIÇÃO DE CAMINHOS
BASE_DIR = Path(__file__).resolve().parent
frontend_dist = BASE_DIR / "frontend" / "dist"

# 3. INICIALIZAÇÃO DO APP (Deve vir antes de qualquer uso da variável 'app')
app = FastAPI(title="API DICOMPEL")

# 4. CONFIGURAÇÃO DE CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ======= MODELOS =======
class LoginRequest(BaseModel):
    email: str
    password: str

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

# ======= ROTAS DA API =======

@app.post("/login")
def login(data: LoginRequest):
    from backend.database import get_connection
    conn = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT id, nome, email, senha_hash, perfil, ativo, criado_em
            FROM usuarios
            WHERE email = ?
        """, (data.email,))
        row = cursor.fetchone()

        if not row:
            return {"success": False, "message": "Usuário não encontrado"}

        cols = [c[0] for c in cursor.description]
        user = dict(zip(cols, row))

        # Nota: Você está usando comparação direta. Certifique-se que no banco a senha é '123456'
        if user["senha_hash"] != data.password:
            return {"success": False, "message": "Senha incorreta"}

        user.pop("senha_hash")
        return {"success": True, "user": user}
    except Exception as e:
        logger.error(f"Erro no login: {str(e)}")
        return {"success": False, "message": "Erro ao fazer login"}
    finally:
        if conn: conn.close()

@app.get("/products")
def products():
    from backend.database import get_connection
    conn = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT ProductID, ProductCode, ProductName, Category, 
                   Brand, Line, TechnicalSpecs, ImageData
            FROM Products 
            ORDER BY ProductName
        """)
        rows = cursor.fetchall()
        cols = [c[0] for c in cursor.description]
        data = []
        for r in rows:
            item = dict(zip(cols, r))
            item["imageUrl"] = item.get("ImageData") if item.get("ImageData") else ""
            data.append(item)
        return data
    except Exception as e:
        logger.error(f"Erro nos produtos: {str(e)}")
        return {"error": str(e)}
    finally:
        if conn: conn.close()

@app.get("/orders")
def all_orders():
    from backend.database import get_connection
    conn = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT OrderId, OrderNumber, CustomerName, CustomerEmail, CustomerPhone,
                   RepresentativeID, Region, Status, CONVERT(VARCHAR(30), CreatedAt, 120) as CreatedAt
            FROM Orders 
            ORDER BY CreatedAt DESC
        """)
        rows = cursor.fetchall()
        cols = [c[0] for c in cursor.description]
        return [dict(zip(cols, r)) for r in rows]
    except Exception as e:
        logger.error(f"Erro ao buscar pedidos: {str(e)}")
        return []
    finally:
        if conn: conn.close()

@app.get("/health")
def health():
    return {"status": "ok", "message": "API DICOMPEL funcionando"}

# ======= MONTAGEM DE ARQUIVOS ESTÁTICOS =======

if frontend_dist.exists():
    logger.info(f"✅ Frontend encontrado em: {frontend_dist}")
    assets_path = frontend_dist / "assets"
    if assets_path.exists():
        app.mount("/assets", StaticFiles(directory=str(assets_path)), name="assets")
else:
    logger.error(f"❌ Pasta dist NÃO encontrada em: {frontend_dist}")

# ======= SERVIR FRONTEND (CATCH-ALL) =======

@app.get("/{full_path:path}")
async def serve_frontend(full_path: str):
    # Ignora rotas que começam com 'api' (se você tiver prefixo) ou outras rotas específicas
    file_path = frontend_dist / full_path
    
    if file_path.exists() and file_path.is_file():
        return FileResponse(file_path)
    
    index_path = frontend_dist / "index.html"
    if index_path.exists():
        return FileResponse(index_path)
    
    return {"error": "Frontend não encontrado"}

# ======= INICIALIZAÇÃO =======

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
