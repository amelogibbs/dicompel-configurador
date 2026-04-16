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

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# ===== SERVIR FRONTEND =====
frontend_dist = Path(__file__).parent / "frontend" / "dist"

if frontend_dist.exists():
    print(f"✅ Frontend encontrado em: {frontend_dist}")
    app.mount("/assets", StaticFiles(directory=frontend_dist / "assets"), name="assets")
else:
    print(f"⚠️  Frontend não encontrado em: {frontend_dist}")

# ===== CORS =====
    app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://configurador.dicompel.com.br"], # Em produção, substitua pelo seu domínio real
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
        if conn:
            conn.close()

# ======= PRODUTOS - GET =======
@app.get("/products")
def products():
    from backend.database import get_connection
    conn = None
    try:
        conn = get_connection()
        cursor = conn.cursor()

        # Convertemos todas as colunas problemáticas para VARCHAR diretamente no SQL
        # Se você tiver colunas de data de criação ou modificação, adicione-as aqui como string
        cursor.execute("""
            SELECT 
                ProductID, 
                ProductCode, 
                ProductName, 
                Category, 
                Brand, 
                Line, 
                TechnicalSpecs, 
                ImageData
            FROM Products 
            ORDER BY ProductName
        """)

        rows = cursor.fetchall()
        cols = [c[0] for c in cursor.description]
        
        data = []
        for r in rows:
            # Criamos o dicionário tratando possíveis valores nulos ou tipos incompatíveis
            item = dict(zip(cols, r))
            # Garante que a imageUrl não venha nula para o front-end
            item["imageUrl"] = item.get("ImageData") if item.get("ImageData") else ""
            data.append(item)

        return data

    except Exception as e:
        import traceback
        error_msg = traceback.format_exc()
        return {"error": str(e), "details": "Erro ao converter tipos de dados do SQL"}
    finally:
        if conn:
            conn.close()

# ======= PRODUTOS - CREATE =======
@app.post("/products")
def create_product(payload: ProductPayload):
    from backend.database import get_connection
    
    conn = None
    try:
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("""
            INSERT INTO Products 
            (ProductCode, ProductName, Category, Line, ImageData)
            VALUES (?, ?, ?, ?, ?)
        """, (
            payload.code,
            payload.description,
            payload.category,
            payload.line,
            payload.imageUrl,
        ))

        conn.commit()

        cursor.execute("SELECT @@IDENTITY AS id")
        product_id = cursor.fetchone()[0]

        logger.info(f"Produto criado: {payload.code}")
        return {"success": True, "product_id": product_id, "message": "Produto cadastrado com sucesso"}

    except Exception as e:
        logger.error(f"Erro ao criar produto: {str(e)}")
        return {"success": False, "message": f"Erro ao cadastrar produto: {str(e)}"}

    finally:
        if conn:
            conn.close()

# ======= PRODUTOS - UPDATE =======
@app.put("/products/{product_id}")
def update_product(product_id: str, payload: ProductPayload):
    from backend.database import get_connection
    
    conn = None
    try:
        if not product_id or product_id == "NaN":
            return {"success": False, "message": "ID do produto inválido"}

        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute(
            "SELECT ProductID FROM Products WHERE ProductID = ?",
            (product_id,)
        )
        if not cursor.fetchone():
            return {"success": False, "message": "Produto não encontrado"}

        cursor.execute("""
            UPDATE Products 
            SET ProductCode=?, ProductName=?, Category=?, Line=?, ImageData=?
            WHERE ProductID=?
        """, (
            payload.code,
            payload.description,
            payload.category,
            payload.line,
            payload.imageUrl,
            product_id,
        ))

        conn.commit()
        logger.info(f"Produto atualizado: {product_id}")
        return {"success": True, "message": "Produto atualizado com sucesso"}

    except Exception as e:
        logger.error(f"Erro ao atualizar produto: {str(e)}")
        return {"success": False, "message": f"Erro ao atualizar produto: {str(e)}"}

    finally:
        if conn:
            conn.close()

# ======= PRODUTOS - DELETE =======
@app.delete("/products/{product_id}")
def delete_product(product_id: str):
    from backend.database import get_connection
    
    conn = None
    try:
        if not product_id or product_id == "NaN":
            print(f"❌ ID inválido: {product_id}")
            return {"success": False, "message": "ID do produto inválido"}

        conn = get_connection()
        cursor = conn.cursor()

        print(f"\n{'=' * 50}")
        print(f"🔍 DELETE DEBUG")
        print(f"{'=' * 50}")
        print(f"ProductID recebido: {product_id}")
        print(f"Tipo: {type(product_id)}")

        print(f"\n📋 Verificando se produto existe...")
        cursor.execute(
            "SELECT ProductID, ProductCode, ProductName FROM Products WHERE ProductID = ?",
            (product_id,)
        )
        produto = cursor.fetchone()
        print(f"Produto encontrado: {produto}")

        if not produto:
            print(f"❌ Produto NÃO encontrado no banco!")
            return {"success": False, "message": "Produto não encontrado"}

        print(f"\n🗑️  Tentando deletar...")
        cursor.execute(
            "DELETE FROM Products WHERE ProductID = ?",
            (product_id,)
        )

        linhas_afetadas = cursor.rowcount
        print(f"Linhas afetadas: {linhas_afetadas}")

        print(f"\n💾 Fazendo commit...")
        conn.commit()
        print(f"✅ Commit realizado com sucesso!")

        print(f"\n🔍 Verificando se produto foi deletado...")
        cursor.execute(
            "SELECT COUNT(*) as total FROM Products WHERE ProductID = ?",
            (product_id,)
        )
        resultado = cursor.fetchone()
        print(f"Produto ainda existe? {resultado[0]} registros")

        if resultado[0] == 0:
            print(f"✅ SUCESSO! Produto deletado!")
            logger.info(f"Produto deletado: {product_id}")
            return {"success": True, "message": "Produto deletado com sucesso"}
        else:
            print(f"❌ FALHA! Produto ainda existe no banco!")
            return {"success": False, "message": "Falha ao deletar produto"}

    except Exception as e:
        print(f"\n❌ ERRO GERAL: {str(e)}")
        import traceback
        traceback.print_exc()
        logger.error(f"Erro ao deletar produto: {str(e)}")
        return {"success": False, "message": f"Erro: {str(e)}"}

    finally:
        if conn:
            conn.close()
        print(f"{'=' * 50}\n")

# ======= TODOS PEDIDOS =======
@app.get("/orders")
def all_orders():
    from backend.database import get_connection
    
    conn = None
    try:
        conn = get_connection()
        cursor = conn.cursor()

        print(f"\n{'=' * 50}")
        print(f"📋 GET /orders - Buscando TODOS os pedidos")
        print(f"{'=' * 50}")

        cursor.execute("""
            SELECT 
                OrderId,
                OrderNumber,
                CustomerName,
                CustomerEmail,
                CustomerPhone,
                RepresentativeID,
                Region,
                Status,
                CONVERT(VARCHAR(30), CreatedAt, 120) as CreatedAt
            FROM Orders 
            ORDER BY CreatedAt DESC
        """)

        rows = cursor.fetchall()
        cols = [c[0] for c in cursor.description]

        print(f"Colunas: {cols}")
        print(f"Total de linhas: {len(rows)}")

        result = [dict(zip(cols, r)) for r in rows]

        print(f"✅ Retornando {len(result)} pedidos")
        print(f"{'=' * 50}\n")

        return result

    except Exception as e:
        print(f"❌ ERRO ao buscar pedidos: {str(e)}")
        import traceback
        traceback.print_exc()
        logger.error(f"Erro ao buscar pedidos: {str(e)}")
        return []

    finally:
        if conn:
            conn.close()

# ======= PEDIDOS REPRESENTANTE =======
@app.get("/orders/representante/{rep_id}")
def get_orders_by_rep(rep_id: str):
    from backend.database import get_connection
    
    conn = None
    try:
        conn = get_connection()
        cursor = conn.cursor()

        if rep_id.isdigit():
            rep_id = f"00000000-0000-0000-0000-{int(rep_id):012d}"

        print(f"\n📋 Buscando pedidos do representante: {rep_id}")

        cursor.execute("""
            SELECT 
                OrderId,
                OrderNumber,
                CustomerName,
                CustomerEmail,
                CustomerPhone,
                RepresentativeID,
                Region,
                Status,
                CONVERT(VARCHAR(30), CreatedAt, 120) as CreatedAt
            FROM Orders
            WHERE RepresentativeID = ?
            ORDER BY CreatedAt DESC
        """, (rep_id,))

        rows = cursor.fetchall()
        cols = [c[0] for c in cursor.description]

        result = [dict(zip(cols, r)) for r in rows]
        print(f"✅ Total de pedidos encontrados: {len(result)}")

        return result

    except Exception as e:
        logger.error(f"Erro ao buscar pedidos: {str(e)}")
        return []

    finally:
        if conn:
            conn.close()

# ======= PEDIDO COM ITENS =======
@app.get("/orders/{order_id}")
def get_order_with_items(order_id: int):
    from backend.database import get_connection
    
    conn = None
    try:
        conn = get_connection()
        cursor = conn.cursor()

        print(f"\n{'=' * 50}")
        print(f"📋 GET /orders/{order_id}")
        print(f"{'=' * 50}")

        cursor.execute("""
            SELECT 
                OrderId,
                OrderNumber,
                CustomerName,
                CustomerEmail,
                CustomerPhone,
                RepresentativeID,
                Region,
                Status,
                CONVERT(VARCHAR(30), CreatedAt, 120) as CreatedAt
            FROM Orders 
            WHERE OrderId = ?
        """, (order_id,))

        order_row = cursor.fetchone()

        if not order_row:
            print(f"❌ Pedido não encontrado: {order_id}")
            return {"success": False, "message": "Pedido não encontrado"}

        cols = [c[0] for c in cursor.description]
        order = dict(zip(cols, order_row))

        print(f"✅ Pedido encontrado: {order['OrderNumber']}")

        cursor.execute("""
            SELECT 
                oi.OrderItemId,
                oi.ProductId,
                p.ProductCode,
                p.ProductName,
                oi.Quantity
            FROM OrderItems oi
            LEFT JOIN Products p ON oi.ProductId = p.ProductID
            WHERE oi.OrderId = ?
        """, (order_id,))

        items_rows = cursor.fetchall()
        items_cols = [c[0] for c in cursor.description]
        items = [dict(zip(items_cols, row)) for row in items_rows]

        print(f"✅ Total de itens: {len(items)}")

        order["items"] = items

        print(f"{'=' * 50}\n")

        return {"success": True, "order": order}

    except Exception as e:
        print(f"❌ ERRO: {str(e)}")
        import traceback
        traceback.print_exc()
        logger.error(f"Erro ao buscar pedido: {str(e)}")
        return {"success": False, "message": f"Erro: {str(e)}"}

    finally:
        if conn:
            conn.close()

# ======= CRIAR PEDIDO =======
@app.post("/orders")
def create_order(payload: OrderPayload):
    from backend.database import get_connection
    
    conn = None
    try:
        if not payload.representativeId or not payload.items:
            return {"success": False, "message": "Dados obrigatórios faltando"}

        conn = get_connection()
        cursor = conn.cursor()

        print(f"\n{'=' * 50}")
        print(f"📝 CRIANDO PEDIDO")
        print(f"{'=' * 50}")
        print(f"Representante: {payload.representativeId}")
        print(f"Total de itens: {payload.totalQuantity}")
        print(f"Itens: {len(payload.items)}")

        rep_id = payload.representativeId

        if rep_id.isdigit():
            rep_id = f"00000000-0000-0000-0000-{int(rep_id):012d}"

        print(f"RepresentativeID convertido: {rep_id}")

        cursor.execute("""
            INSERT INTO Orders (CustomerName, CustomerEmail, CustomerPhone,
              RepresentativeID, Region, Status, CreatedAt)
            VALUES (?, ?, ?, ?, ?, ?, GETDATE())
        """, (
            f"Cliente {payload.userId}",
            "",
            "",
            rep_id,
            "Geral",
            payload.status,
        ))

        cursor.execute("SELECT @@IDENTITY AS id")
        order_id = cursor.fetchone()[0]

        print(f"Pedido ID: {order_id}")

        cursor.execute("SELECT OrderNumber FROM Orders WHERE OrderId = ?", (order_id,))

        order_number_row = cursor.fetchone()

        numero_pedido = order_number_row[0] if order_number_row else f"PED-{order_id}"

        for item in payload.items:
            print(f"  - {item.productCode} (Qtd: {item.quantity})")
            cursor.execute("""
                INSERT INTO OrderItems (OrderId, ProductId, Quantity)
                VALUES (?, ?, ?)
            """, (order_id, item.productId, item.quantity))

        conn.commit()
        print(f"✅ Pedido criado com sucesso!")
        print(f"Número do pedido: {numero_pedido}")
        print(f"{'=' * 50}\n")

        logger.info(f"Pedido criado: {numero_pedido}")
        return {
            "success": True,
            "order_id": order_id,
            "numero_pedido": numero_pedido,
            "message": "Pedido criado com sucesso"
        }

    except Exception as e:
        print(f"❌ ERRO ao criar pedido: {str(e)}")
        import traceback
        traceback.print_exc()
        logger.error(f"Erro ao criar pedido: {str(e)}")
        return {"success": False, "message": f"Erro ao criar pedido: {str(e)}"}

    finally:
        if conn:
            conn.close()

# ======= ATUALIZAR PEDIDO =======
@app.put("/orders/{order_id}")
def update_order(order_id: int, payload: UpdateOrderPayload):
    from backend.database import get_connection
    
    conn = None
    try:
        if not order_id:
            return {"success": False, "message": "ID do pedido inválido"}

        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("SELECT OrderId FROM Orders WHERE OrderId = ?", (order_id,))

        if not cursor.fetchone():
            return {"success": False, "message": "Pedido não encontrado"}

        cursor.execute("""
            UPDATE Orders SET CustomerName=?, CustomerEmail=?, CustomerPhone=?, Status=?
            WHERE OrderId=?
        """, (
            payload.CustomerName,
            payload.CustomerEmail,
            payload.CustomerPhone,
            payload.Status,
            order_id,
        ))

        if payload.itens:
            cursor.execute("DELETE FROM OrderItems WHERE OrderId=?", (order_id,))

            for item in payload.itens:
                cursor.execute("""
                    INSERT INTO OrderItems (OrderId, ProductId, Quantity)
                    VALUES (?, ?, ?)
                """, (order_id, item.productId, item.quantity))

        conn.commit()
        logger.info(f"Pedido atualizado: {order_id}")
        return {"success": True, "message": "Pedido atualizado com sucesso"}

    except Exception as e:
        logger.error(f"Erro ao atualizar pedido: {str(e)}")
        return {"success": False, "message": f"Erro ao atualizar pedido: {str(e)}"}

    finally:
        if conn:
            conn.close()

# ======= DELETAR PEDIDO =======
@app.delete("/orders/{order_id}")
def delete_order(order_id: int):
    from backend.database import get_connection
    
    conn = None
    try:
        if not order_id:
            return {"success": False, "message": "ID do pedido inválido"}

        conn = get_connection()
        cursor = conn.cursor()

        print(f"\n{'=' * 50}")
        print(f"🗑️  DELETANDO PEDIDO {order_id}")
        print(f"{'=' * 50}")

        cursor.execute("SELECT OrderId FROM Orders WHERE OrderId = ?", (order_id,))

        if not cursor.fetchone():
            print(f"❌ Pedido não encontrado")
            return {"success": False, "message": "Pedido não encontrado"}

        cursor.execute("DELETE FROM OrderItems WHERE OrderId=?", (order_id,))
        print(f"✅ Itens deletados")

        cursor.execute("DELETE FROM Orders WHERE OrderId=?", (order_id,))
        print(f"✅ Pedido deletado")

        conn.commit()
        print(f"✅ Commit realizado")
        print(f"{'=' * 50}\n")

        logger.info(f"Pedido deletado: {order_id}")
        return {"success": True, "message": "Pedido deletado com sucesso"}

    except Exception as e:
        print(f"❌ ERRO: {str(e)}")
        import traceback
        traceback.print_exc()
        logger.error(f"Erro ao deletar pedido: {str(e)}")
        return {"success": False, "message": f"Erro ao deletar pedido: {str(e)}"}

    finally:
        if conn:
            conn.close()

# ======= FILTROS DINÂMICOS =======
@app.get("/filters")
def get_filters():
    from backend.database import get_connection
    
    conn = None
    try:
        conn = get_connection()
        cursor = conn.cursor()

        print(f"\n{'=' * 50}")
        print(f"🔍 GET /filters - Buscando filtros disponíveis")
        print(f"{'=' * 50}")

        cursor.execute("SELECT DISTINCT Category FROM Products WHERE Category IS NOT NULL ORDER BY Category")
        categories = [row[0] for row in cursor.fetchall()]

        cursor.execute("SELECT DISTINCT Line FROM Products WHERE Line IS NOT NULL ORDER BY Line")
        lines = [row[0] for row in cursor.fetchall()]

        cursor.execute("SELECT DISTINCT Brand FROM Products WHERE Brand IS NOT NULL ORDER BY Brand")
        brands = [row[0] for row in cursor.fetchall()]

        print(f"✅ Categorias: {len(categories)}")
        print(f"✅ Linhas: {len(lines)}")
        print(f"✅ Marcas: {len(brands)}")
        print(f"{'=' * 50}\n")

        return {
            "success": True,
            "categories": categories,
            "lines": lines,
            "brands": brands,
        }

    except Exception as e:
        logger.error(f"Erro ao buscar filtros: {str(e)}")
        print(f"❌ ERRO: {str(e)}")
        return {"success": False, "message": f"Erro: {str(e)}"}

    finally:
        if conn:
            conn.close()

# ======= REPRESENTANTES - GET TODOS =======
@app.get("/representatives")
def get_representatives():
    from backend.database import get_connection
    
    conn = None
    try:
        conn = get_connection()
        cursor = conn.cursor()

        print(f"\n{'=' * 50}")
        print(f"👥 GET /representatives - Buscando representantes")
        print(f"{'=' * 50}")

        cursor.execute("""
            SELECT id, nome, email, telefone, regiao, comissao, ativo, criado_em
            FROM usuarios
            WHERE perfil = 'representante'
            ORDER BY nome
        """)

        rows = cursor.fetchall()
        cols = [c[0] for c in cursor.description]

        result = [dict(zip(cols, r)) for r in rows]

        print(f"✅ Total de representantes: {len(result)}")
        print(f"{'=' * 50}\n")

        return result

    except Exception as e:
        logger.error(f"Erro ao buscar representantes: {str(e)}")
        print(f"❌ ERRO: {str(e)}")
        return []

    finally:
        if conn:
            conn.close()

# ======= REPRESENTANTES - CREATE =======
@app.post("/representatives")
def create_representative(payload: dict):
    from backend.database import get_connection
    
    conn = None
    try:
        conn = get_connection()
        cursor = conn.cursor()

        print(f"\n{'=' * 50}")
        print(f"👤 POST /representatives - Criando representante")
        print(f"{'=' * 50}")

        nome = payload.get("nome")
        email = payload.get("email")
        telefone = payload.get("telefone")
        regiao = payload.get("regiao")
        comissao = payload.get("comissao", 0)
        senha = payload.get("senha")

        print(f"Nome: {nome}")
        print(f"Email: {email}")
        print(f"Região: {regiao}")

        cursor.execute("""
            INSERT INTO usuarios (nome, email, telefone, regiao, comissao, senha_hash, perfil, ativo, criado_em)
            VALUES (?, ?, ?, ?, ?, ?, 'representante', 1, GETDATE())
        """, (nome, email, telefone, regiao, comissao, senha))

        conn.commit()

        print(f"✅ Representante criado com sucesso!")
        print(f"{'=' * 50}\n")

        logger.info(f"Representante criado: {nome}")
        return {"success": True, "message": "Representante cadastrado com sucesso"}

    except Exception as e:
        logger.error(f"Erro ao criar representante: {str(e)}")
        print(f"❌ ERRO: {str(e)}")
        return {"success": False, "message": f"Erro: {str(e)}"}

    finally:
        if conn:
            conn.close()

# ======= REPRESENTANTES - UPDATE =======
@app.put("/representatives/{rep_id}")
def update_representative(rep_id: int, payload: dict):
    from backend.database import get_connection
    
    conn = None
    try:
        conn = get_connection()
        cursor = conn.cursor()

        print(f"\n{'=' * 50}")
        print(f"✏️  PUT /representatives/{rep_id} - Atualizando representante")
        print(f"{'=' * 50}")

        nome = payload.get("nome")
        email = payload.get("email")
        telefone = payload.get("telefone")
        regiao = payload.get("regiao")
        comissao = payload.get("comissao", 0)
        senha = payload.get("senha")

        cursor.execute("SELECT id FROM usuarios WHERE id = ?", (rep_id,))

        if not cursor.fetchone():
            return {"success": False, "message": "Representante não encontrado"}

        if senha:
            cursor.execute("""
                UPDATE usuarios
                SET nome=?, email=?, telefone=?, regiao=?, comissao=?, senha_hash=?
                WHERE id=?
            """, (nome, email, telefone, regiao, comissao, senha, rep_id))
        else:
            cursor.execute("""
                UPDATE usuarios
                SET nome=?, email=?, telefone=?, regiao=?, comissao=?
                WHERE id=?
            """, (nome, email, telefone, regiao, comissao, rep_id))

        conn.commit()

        print(f"✅ Representante atualizado!")
        print(f"{'=' * 50}\n")

        logger.info(f"Representante atualizado: {rep_id}")
        return {"success": True, "message": "Representante atualizado com sucesso"}

    except Exception as e:
        logger.error(f"Erro ao atualizar representante: {str(e)}")
        print(f"❌ ERRO: {str(e)}")
        return {"success": False, "message": f"Erro: {str(e)}"}

    finally:
        if conn:
            conn.close()

# ======= REPRESENTANTES - DELETE =======
@app.delete("/representatives/{rep_id}")
def delete_representative(rep_id: int):
    from backend.database import get_connection
    
    conn = None
    try:
        conn = get_connection()
        cursor = conn.cursor()

        print(f"\n{'=' * 50}")
        print(f"🗑️  DELETE /representatives/{rep_id}")
        print(f"{'=' * 50}")

        cursor.execute("SELECT id FROM usuarios WHERE id = ?", (rep_id,))

        if not cursor.fetchone():
            return {"success": False, "message": "Representante não encontrado"}

        cursor.execute("DELETE FROM usuarios WHERE id = ?", (rep_id,))
        conn.commit()

        print(f"✅ Representante deletado!")
        print(f"{'=' * 50}\n")

        logger.info(f"Representante deletado: {rep_id}")
        return {"success": True, "message": "Representante deletado com sucesso"}

    except Exception as e:
        logger.error(f"Erro ao deletar representante: {str(e)}")
        print(f"❌ ERRO: {str(e)}")
        return {"success": False, "message": f"Erro: {str(e)}"}

    finally:
        if conn:
            conn.close()

# ======= ESTATÍSTICAS =======
@app.get("/stats/summary")
def get_stats_summary():
    from backend.database import get_connection
    
    conn = None
    try:
        conn = get_connection()
        cursor = conn.cursor()

        print(f"\n{'=' * 50}")
        print(f"📊 CARREGANDO ESTATÍSTICAS")
        print(f"{'=' * 50}")

        cursor.execute("SELECT COUNT(*) as total FROM Orders")
        total_pedidos = cursor.fetchone()[0]

        cursor.execute("SELECT Status, COUNT(*) as total FROM Orders GROUP BY Status")
        status_rows = cursor.fetchall()
        status_dict = {row[0]: row[1] for row in status_rows}

        cursor.execute("SELECT COUNT(*) as total FROM OrderItems")
        total_itens = cursor.fetchone()[0]

        cursor.execute("SELECT SUM(Quantity) as total FROM OrderItems")
        total_quantidade_row = cursor.fetchone()
        total_quantidade = total_quantidade_row[0] if total_quantidade_row[0] else 0

        print(f"Total de pedidos: {total_pedidos}")
        print(f"Status: {status_dict}")
        print(f"Total de itens: {total_itens}")
        print(f"Total de quantidade: {total_quantidade}")
        print(f"{'=' * 50}\n")

        return {
            "success": True,
            "totalPedidos": total_pedidos,
            "pedidosPendentes": status_dict.get("PENDING", 0),
            "pedidosAprovados": status_dict.get("APPROVED", 0),
            "totalItens": total_itens,
            "totalQuantidade": total_quantidade,
        }

    except Exception as e:
        logger.error(f"Erro ao buscar estatísticas: {str(e)}")
        print(f"❌ ERRO: {str(e)}")
        return {"success": False, "message": f"Erro: {str(e)}"}

    finally:
        if conn:
            conn.close()

# ======= HEALTH CHECK =======
@app.get("/health")
def health():
    return {"status": "ok", "message": "API funcionando corretamente"}

# ======= ROOT =======
@app.get("/")
def root():
    return {
        "message": "API DICOMPEL - Configurador de Produtos",
        "version": "1.0.0",
        "endpoints": {
            "login": "POST /login",
            "products": "GET /products",
            "filters": "GET /filters",
            "orders": "GET /orders",
            "order_details": "GET /orders/{order_id}",
            "representatives": "GET /representatives",
            "stats": "GET /stats/summary",
            "health": "GET /health"
        }
    }

# ======= SERVIR FRONTEND - CATCH-ALL =======
@app.get("/{full_path:path}")
async def serve_frontend(full_path: str):
    """Serve frontend files, fallback to index.html for SPA routing"""
    file_path = frontend_dist / full_path
    
    if file_path.exists() and file_path.is_file():
        return FileResponse(file_path)
    
    # Fallback para index.html (SPA routing)
    index_path = frontend_dist / "index.html"
    if index_path.exists():
        return FileResponse(index_path)
    
    return {"error": "Frontend não encontrado"}

# ======= INICIALIZAÇÃO =======
if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    print(f"\n{'=' * 50}")
    print(f"🚀 Iniciando DICOMPEL API")
    print(f"{'=' * 50}")
    print(f"Porta: {port}")
    print(f"Frontend: {frontend_dist}")
    print(f"{'=' * 50}\n")
    uvicorn.run(app, host="0.0.0.0", port=port)
