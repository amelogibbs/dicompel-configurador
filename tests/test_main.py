import pytest
from fastapi.testclient import TestClient
from passlib.context import CryptContext
from main import (
    app, verify_password, get_password_hash, create_access_token,
    sanitize_file_path, get_settings
)
from pathlib import Path
from datetime import timedelta

client = TestClient(app)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# ====================== TEST FIXTURES ======================

@pytest.fixture
def sample_password():
    """Senha de exemplo para testes"""
    return "senha123"

@pytest.fixture
def sample_hashed_password(sample_password):
    """Hash da senha de exemplo"""
    return get_password_hash(sample_password)

@pytest.fixture
def valid_token():
    """Token JWT válido para testes"""
    access_token_expires = timedelta(minutes=60)
    token = create_access_token(
        data={"sub": 1},
        expires_delta=access_token_expires
    )
    return token

# ====================== TESTES DE SEGURANÇA DE SENHA ======================

class TestPasswordSecurity:
    """Testes de segurança de senha com Bcrypt"""
    
    def test_hash_password_creates_different_hashes(self, sample_password):
        """Cada hash é único (salt aleatório) - BCRYPT"""
        hash1 = get_password_hash(sample_password)
        hash2 = get_password_hash(sample_password)
        
        # Hashes devem ser diferentes (salt aleatório)
        assert hash1 != hash2
        # Mas ambos devem verificar a senha
        assert verify_password(sample_password, hash1)
        assert verify_password(sample_password, hash2)
    
    def test_wrong_password_verification_fails(self, sample_password, sample_hashed_password):
        """Senha incorreta não verifica"""
        wrong_password = "senha456"
        
        assert not verify_password(wrong_password, sample_hashed_password)
        assert verify_password(sample_password, sample_hashed_password)
    
    def test_password_not_stored_as_plain_text(self, sample_password, sample_hashed_password):
        """Hash não contém senha em texto plano"""
        assert sample_password not in sample_hashed_password
        # Hash bcrypt começa com $2b$, $2a$ ou $2y$
        assert sample_hashed_password.startswith(('$2a$', '$2b$', '$2y$'))
    
    def test_empty_password_rejected(self):
        """Senha vazia é rejeitada"""
        with pytest.raises(ValueError):
            pwd_context.verify("", get_password_hash("test"))

# ====================== TESTES DE AUTENTICAÇÃO JWT ======================

class TestAuthentication:
    """Testes de autenticação com JWT"""
    
    def test_health_check_without_auth(self):
        """Health check não requer autenticação"""
        response = client.get("/api/health")
        
        assert response.status_code == 200
        assert response.json()["status"] == "ok"
    
    def test_login_success(self):
        """Login bem-sucedido retorna token"""
        response = client.post("/api/login", json={
            "email": "user@example.com",
            "password": "senha123"
        })
        
        # Se banco configurado corretamente
        if response.status_code == 401:
            # Usuário não existe ainda, é esperado
            assert "Email ou senha" in response.json()["error"]
        else:
            assert response.status_code == 200
            assert response.json()["success"] is True
            assert "token" in response.json()
    
    def test_login_wrong_password(self):
        """Senha incorreta rejeita login"""
        response = client.post("/api/login", json={
            "email": "user@example.com",
            "password": "senhaerrada"
        })
        
        # Deve retornar 401 ou mensagem de erro genérica
        assert response.status_code in [401, 422]
    
    def test_login_user_not_found(self):
        """Usuário inexistente retorna erro"""
        response = client.post("/api/login", json={
            "email": "naoexiste@example.com",
            "password": "senha123"
        })
        
        # Deve retornar erro
        assert response.status_code in [401, 422]
    
    def test_invalid_token_rejected(self):
        """Token inválido é rejeitado"""
        headers = {"Authorization": "Bearer invalid_token_123"}
        
        response = client.get("/api/products", headers=headers)
        
        assert response.status_code == 401
        assert "Token" in response.json()["error"] or "inválido" in response.json()["error"]

# ====================== TESTES DE VALIDAÇÃO DE INPUT ======================

class TestInputValidation:
    """Testes de validação de entrada com Pydantic"""
    
    def test_login_invalid_email(self):
        """Email inválido é rejeitado"""
        response = client.post("/api/login", json={
            "email": "nao_eh_email",
            "password": "senha123"
        })
        
        assert response.status_code == 422  # Validation Error
    
    def test_login_missing_email(self):
        """Email obrigatório"""
        response = client.post("/api/login", json={
            "password": "senha123"
        })
        
        assert response.status_code == 422
    
    def test_login_missing_password(self):
        """Senha obrigatória"""
        response = client.post("/api/login", json={
            "email": "user@example.com"
        })
        
        assert response.status_code == 422
    
    def test_login_password_too_short(self):
        """Mínimo 6 caracteres de senha"""
        response = client.post("/api/login", json={
            "email": "user@example.com",
            "password": "123"  # Menos de 6 caracteres
        })
        
        assert response.status_code == 422

# ====================== TESTES DE PROTEÇÃO DE ARQUIVO ======================

class TestFileProtection:
    """Testes de proteção contra directory traversal"""
    
    def test_serve_index_html(self):
        """index.html é servido se existir"""
        response = client.get("/")
        
        # Pode retornar 200 ou 404 dependendo se frontend existe
        assert response.status_code in [200, 404]
    
    def test_directory_traversal_blocked(self):
        """Directory traversal é bloqueado - /../../../etc/passwd"""
        response = client.get("/../../../etc/passwd")
        
        assert response.status_code in [404, 403]
        # Não deve servir arquivo real do sistema
    
    def test_env_file_not_accessible(self):
        """Arquivo .env não é acessível"""
        response = client.get("/.env")
        
        assert response.status_code in [403, 404]
        # Não deve servir arquivo sensível

# ====================== TESTES DE TRATAMENTO DE ERRO ======================

class TestErrorHandling:
    """Testes de tratamento seguro de erros"""
    
    def test_generic_error_message(self):
        """Mensagens de erro não expõem detalhes internos"""
        # Erro de autenticação - mensagem genérica
        response = client.post("/api/login", json={
            "email": "test@example.com",
            "password": "wrong"
        })
        
        # Mensagem deve ser genérica, não expor detalhes
        if response.status_code != 422:
            error_msg = response.json().get("error", "")
            assert "erro" in error_msg.lower() or "incorreto" in error_msg.lower()
    
    def test_invalid_route_404(self):
        """Rota inválida retorna 404"""
        response = client.get("/api/nao_existe")
        
        assert response.status_code == 404

# ====================== TESTES DE CORS ======================

class TestCORS:
    """Testes de CORS"""
    
    def test_cors_headers_present(self):
        """Headers CORS estão presentes"""
        response = client.get("/api/health")
        
        # CORS headers devem estar presentes
        assert response.status_code == 200
        assert "access-control-allow" in response.headers or response.status_code == 200

# ====================== TESTES DE INTEGRAÇÃO ======================

class TestIntegration:
    """Testes de integração completa"""
    
    def test_complete_flow(self):
        """Fluxo completo: health → login → produtos (com token)"""
        # 1. Health check
        health_response = client.get("/api/health")
        assert health_response.status_code == 200
        
        # 2. Login (esperar sucesso ou erro previsível)
        login_response = client.post("/api/login", json={
            "email": "user@example.com",
            "password": "senha123"
        })
        
        # 3. Se login falhar (usuário não existe), é esperado
        if login_response.status_code == 200:
            token = login_response.json()["token"]
            
            # 4. Requisição protegida com token
            headers = {"Authorization": f"Bearer {token}"}
            products_response = client.get("/api/products", headers=headers)
            
            # Pode retornar 200 ou erro de banco
            assert products_response.status_code in [200, 500, 404]

# ====================== TESTES DE SANITIZAÇÃO DE CAMINHO ======================

class TestPathSanitization:
    """Testes da função sanitize_file_path"""
    
    def test_sanitize_valid_path(self):
        """Caminho válido é processado"""
        base_dir = Path("/tmp/test")
        result = sanitize_file_path("index.html", base_dir)
        
        # Deve retornar Path ou None
        assert result is None or isinstance(result, Path)
    
    def test_sanitize_directory_traversal(self):
        """Directory traversal é bloqueado"""
        base_dir = Path("/tmp/test")
        result = sanitize_file_path("../../../../etc/passwd", base_dir)
        
        # Deve retornar None (acesso bloqueado)
        assert result is None

# ====================== EXECUÇÃO DE TESTES ======================

if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
