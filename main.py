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

BASE_DIR = Path(__file__).parent
# Se no seu GitHub os arquivos estiverem direto em 'frontend', remova o 'dist'
frontend_path = BASE_DIR / "frontend" / "dist" 

if frontend_path.exists():
    app.mount("/assets", StaticFiles(directory=str(frontend_path / "assets")), name="assets")
# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# ===== SERVIR FRONTEND =====
# Ajustado para procurar na pasta correta do build do Vite/React
frontend_dist = Path(__file__).parent / "frontend" / "dist"

if frontend_dist.exists():
    logger.info(f"✅ Frontend encontrado em: {frontend_dist}")
    # Monta os assets (JS/CSS)
    if (frontend_dist / "assets").exists():
        app.mount("/assets", StaticFiles(directory=frontend_dist / "assets"), name="assets")
else:
    logger.warning(f"⚠️ Frontend não encontrado em: {frontend_dist}")

# ===== CORS (CORRIGIDO) =====
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://configurador.dicompel.com.br", "http://localhost:3000"],
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

class UpdateOrderPayload(BaseModel):
    CustomerName: Optional[str] = None
    CustomerEmail: Optional[str] = None
    CustomerPhone: Optional[str] = None
    Status: Optional[str] = None
    itens: Optional[List[OrderItem]] = None

class ProductPayload(BaseModel):
    code: str
    description: str
    line: str
    category: Optional[str] = "Geral"
    reference: Optional[str] = ""
    amperage: Optional[str] = ""
    colors: Optional[List[str]] = []
    imageUrl: Optional[str] = ""

# ======= LOGIN =======
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

        if user["senha_hash"] != data.password:
            return {"success": False, "message": "Senha incorreta"}

        user.pop("senha_hash")
        return {"success": True, "user": user}
    except Exception as e:
        logger.error(f"Erro no login: {str(e)}")
        return {"success": False, "message": "Erro ao fazer login"}
    finally:
        if conn: conn.close()

# ======= PRODUTOS - GET (CORRIGIDO) =======
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

# ======= TODOS PEDIDOS (CORRIGIDO PARA EVITAR ERRO -155) =======
@app.get("/orders")
def all_orders():
    from backend.database import get_connection
    conn = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        # IMPORTANTE: CONVERT(VARCHAR, CreatedAt, 120) evita erro de tipo de data
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

# ======= ESTATÍSTICAS =======
@app.get("/stats/summary")
def get_stats_summary():
    from backend.database import get_connection
    conn = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) as total FROM Orders")
        total_pedidos = cursor.fetchone()[0]
        cursor.execute("SELECT Status, COUNT(*) as total FROM Orders GROUP BY Status")
        status_dict = {row[0]: row[1] for row in cursor.fetchall()}
        return {
            "success": True,
            "totalPedidos": total_pedidos,
            "pedidosPendentes": status_dict.get("PENDING", 0),
            "pedidosAprovados": status_dict.get("APPROVED", 0)
        }
    except Exception as e:
        return {"success": False, "message": str(e)}
    finally:
        if conn: conn.close()

# ======= DEMAIS ROTAS (FILTROS, REPRESENTANTES, ETC) =======
# [Mantidas conforme seu original para não perder funcionalidades]
@app.get("/filters")
def get_filters():
    from backend.database import get_connection
    conn = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT DISTINCT Category FROM Products WHERE Category IS NOT NULL")
        categories = [row[0] for row in cursor.fetchall()]
        return {"success": True, "categories": categories}
    except Exception as e:
        return {"success": False, "message": str(e)}
    finally:
        if conn: conn.close()

# ======= HEALTH CHECK =======
@app.get("/health")
def health():
    return {"status": "ok", "message": "API DICOMPEL funcionando"}

# ======= SERVIR FRONTEND - CATCH-ALL (SPA ROUTING) =======
@app.get("/{full_path:path}")
async def serve_frontend(full_path: str):
    file_path = frontend_dist / full_path
    if file_path.exists() and file_path.is_file():
        return FileResponse(file_path)
    
    index_path = frontend_dist / "index.html"
    if index_path.exists():
        return FileResponse(index_path)
    return {"error": "Frontend não encontrado"}

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
# Busca a pasta onde o main.py está e navega até o frontend
BASE_DIR = Path(__file__).resolve().parent
frontend_dist = BASE_DIR / "frontend" / "dist"

# Debug para você ver no log do Azure se o caminho está certo
logger.info(f"🔍 Verificando caminho do frontend: {frontend_dist}")

if frontend_dist.exists():
    logger.info("✅ Pasta dist encontrada!")
    app.mount("/assets", StaticFiles(directory=str(frontend_dist / "assets")), name="assets")
else:
    logger.error("❌ Pasta dist NÃO encontrada. Verifique se o build foi enviado ao GitHub.")
