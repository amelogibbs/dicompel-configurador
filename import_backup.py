import pyodbc
import re
from datetime import datetime

# Configuração Azure
SERVER = 'configurador-produto-sql.database.windows.net'
DATABASE = 'configurador-produto'
USERNAME = 'adminsql'
PASSWORD = 'Dicompel!$$'
DRIVER = 'ODBC Driver 18 for SQL Server'

connection_string = f'Driver={{{DRIVER}}};Server={SERVER},1433;Database={DATABASE};Uid={USERNAME};Pwd={PASSWORD};Encrypt=yes;TrustServerCertificate=no;Connection Timeout=60;'

print(f"🔗 Tentando conectar ao Azure...")

try:
    conn = pyodbc.connect(connection_string, timeout=60)
    cursor = conn.cursor()
    print("✅ Conectado ao SQL Server Azure!\n")
except Exception as e:
    print(f"❌ Erro ao conectar: {e}\n")
    exit()

# Ler arquivo SQL do backup
try:
    with open('backup.sql', 'r', encoding='utf-8') as f:
        sql_content = f.read()
    print("✅ Arquivo SQL lido!")
except FileNotFoundError:
    print("❌ Arquivo 'backup.sql' não encontrado!")
    exit()

# NOVO: Extrair cada bloco VALUES(...) corretamente
# Procura por padrão: VALUES (...), (...), (...);
pattern = r"\(\s*'([^']*)',\s*'([^']*)',\s*'([^']*)',\s*'([^']*)',\s*'([^']*)',\s*'([^']*)',\s*'([^']*)',\s*ARRAY\[([^\]]*)\],\s*'([^']*)',\s*'([^']*)',\s*'([^']*)'\s*\)"

matches = re.findall(pattern, sql_content)

print(f"📊 Encontrados {len(matches)} registros para importar\n")

imported = 0
errors = 0

for i, match in enumerate(matches, 1):
    try:
        # match é uma tupla com os 11 campos
        product_id = match[0]
        product_code = match[1]
        product_name = match[2]
        reference = match[3]
        category = match[4] if match[4] else None
        subcategory = match[5]
        line = match[6] if match[6] else None
        colors = match[7]
        image_data = match[8] if match[8] else None
        amperage = match[9] if match[9] else None
        technical_specs = match[10] if match[10] else None

        # Inserir no banco
        insert_sql = """
        INSERT INTO Products 
        (ProductID, ProductCode, ProductName, Category, Line, ImageData, TechnicalSpecs, CreatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """

        cursor.execute(insert_sql, (
            product_id,
            product_code,
            product_name,
            category,
            line,
            image_data,
            technical_specs,
            datetime.now()
        ))

        imported += 1
        print(f"✅ [{i}/{len(matches)}] {product_code} - {product_name[:40]}")

    except Exception as e:
        errors += 1
        print(f"❌ Erro no registro {i}: {str(e)[:80]}")

# Commit
try:
    conn.commit()
    print(f"\n{'=' * 60}")
    print(f"✅ IMPORTAÇÃO CONCLUÍDA!")
    print(f"{'=' * 60}")
    print(f"📊 Importados: {imported}")
    print(f"❌ Erros: {errors}")
    print(f"{'=' * 60}")
except Exception as e:
    print(f"❌ Erro ao fazer commit: {e}")
finally:
    cursor.close()
    conn.close()