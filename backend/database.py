import pyodbc

# ============================================================
# 🔹 CONEXÃO COM AZURE SQL VIA PYODBC (BACKEND OFICIAL)
# ============================================================

def get_connection():
    conn_str = (
        "DRIVER={ODBC Driver 18 for SQL Server};"
        "SERVER=tcp:configurador-produto-sql.database.windows.net,1433;"
        "DATABASE=configurador-produto;"
        "UID=adminsql;"
        "PWD=Dicompel!$$;'
        "Encrypt=yes;"
        "TrustServerCertificate=no;"
        "Connection Timeout=30;"
    )

    return pyodbc.connect(conn_str)


# ============================================================
# 🔹 TESTE OPCIONAL
# ============================================================

if __name__ == "__main__":
    try:
        conn = get_connection()
        print("✅ Conectado ao Azure SQL com sucesso!")
        conn.close()
    except Exception as e:
        print("❌ Erro ao conectar:", e)
