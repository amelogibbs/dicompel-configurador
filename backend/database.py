import pyodbc
import logging

logger = logging.getLogger(__name__)

def get_connection():
    """
    Conecta ao Azure SQL Server com timeout aumentado
    """
    try:
        conn_str = (
            "DRIVER={ODBC Driver 18 for SQL Server};"
            "SERVER=tcp:configurador-produto-sql.database.windows.net,1433;"
                "DATABASE=configurador-produto;"
                "UID=adminsql;"
                "PWD=Xaviera%%;"
                "Encrypt=yes;"
                "TrustServerCertificate=yes;"  # ← MUDE PARA YES AQUI
                "Connection Timeout=60;"
        )
        
        conn = pyodbc.connect(conn_str)
        logger.info("✅ Conectado ao Azure SQL com sucesso!")
        return conn
        
    except pyodbc.Error as e:
        logger.error(f"❌ Erro ao conectar ao Azure SQL: {str(e)}")
        raise Exception(f"Erro de conexão com banco de dados: {str(e)}")
    except Exception as e:
        logger.error(f"❌ Erro inesperado: {str(e)}")
        raise Exception(f"Erro ao conectar: {str(e)}")

if __name__ == "__main__":
    try:
        conn = get_connection()
        print("✅ Conectado ao Azure SQL com sucesso!")
        conn.close()
    except Exception as e:
        print(f"❌ Erro ao conectar: {e}")
    except Exception as e:
        print(f"❌ Erro ao conectar: {e}")
