import pyodbc
import re

# 1. Configurações de Conexão - AJUSTE AQUI
server = 'configurador-produto-sql.database.windows.net'
database = 'configurador-produto'
username = 'adminsql'
password = 'Dicompel!$$'
driver = '{ODBC Driver 18 for SQL Server}'

conn_str = f'DRIVER={driver};SERVER={server};PORT=1433;DATABASE={database};UID={username};PWD={password};Encrypt=yes;TrustServerCertificate=no;Connection Timeout=30;'


def parse_dicompel_file(file_path):
    """Lê o arquivo e separa os produtos baseando-se no campo 'uuid:'."""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Divide o arquivo toda vez que encontrar 'uuid:' (início de um novo produto)
    raw_blocks = re.split(r'\nuuid:', '\n' + content)
    products = []

    for block in raw_blocks:
        if not block.strip(): continue

        # Dicionário para armazenar os campos do produto atual
        p = {}
        # Regex para capturar campos como 'chave: valor'
        lines = block.strip().split('\n')
        current_key = None

        for line in lines:
            if ':' in line and not line.startswith(' '):
                key, value = line.split(':', 1)
                current_key = key.strip()
                p[current_key] = value.strip()
            elif current_key:
                # Se a linha não tem ':' ou começa com espaço, é continuação do campo anterior
                p[current_key] += " " + line.strip()

        if p: products.append(p)

    return products


def migrate():
    products = parse_dicompel_file('products_rows.txt')
    print(f"🚀 Foram identificados {len(products)} produtos no arquivo.")

    if not products:
        print("⚠️ Nenhum produto encontrado. Verifique se o arquivo 'products_rows.txt' está na pasta.")
        return

    try:
        conn = pyodbc.connect(conn_str)
        cursor = conn.cursor()

        insert_query = """
        INSERT INTO Products (
            ProductCode, ProductName, Category, Brand, Line, 
            TechnicalSpecs, ImageData, Warranty
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """

        for p in products:
            code = p.get('product_code', 'N/A')
            name = p.get('product_name', 'Sem Nome')
            category = p.get('category', '')
            brand = p.get('brand', 'DICOMPEL')
            line_name = p.get('sub_category', '')
            specs = p.get('technical_specifications', '')
            image = p.get('image_data', '')
            warranty = p.get('warranty', '')

            try:
                cursor.execute(insert_query, (
                    code, name, category, brand, line_name, specs, image, warranty
                ))
                print(f"✅ Sucesso: {code}")
            except Exception as e:
                print(f"❌ Erro no item {code}: {e}")

        conn.commit()
        print(f"\n✨ Finalizado! {len(products)} produtos processados.")

    except Exception as e:
        print(f"💥 Erro de conexão com Azure: {e}")
    finally:
        if 'conn' in locals():
            conn.close()


if __name__ == "__main__":
    migrate()