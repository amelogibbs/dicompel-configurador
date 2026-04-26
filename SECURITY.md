# Guia de Segurança - API DICOMPEL v2.0

## 🔐 Melhorias Implementadas

### 1. **Autenticação com JWT**
```python
# Login retorna token JWT
POST /api/login
{
  "email": "user@example.com",
  "password": "senha123"
}

# Resposta
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { ... }
}

# Usar token em requisições protegidas
Authorization: Bearer <token>
```

### 2. **Hash de Senhas com Bcrypt**
- ✅ Senhas nunca são armazenadas em texto plano
- ✅ Cada hash é único (salt aleatório)
- ✅ Verificação segura com `passlib`

**Migração do banco de dados:**
```python
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Converter senhas existentes:
hashed = pwd_context.hash("123456")
# UPDATE usuarios SET senha_hash = 'hashed_value' WHERE id = 1
```

### 3. **Proteção de Rotas**
Rotas sensíveis agora requerem token JWT:
```python
async def get_products(current_user: Dict = Depends(verify_token)):
    # Só executa com token válido
```

**Rotas Públicas:**
- ✅ `GET /api/health` - Sem autenticação
- ✅ `POST /api/login` - Sem autenticação

**Rotas Protegidas:**
- 🔒 `GET /api/products` - Requer token
- 🔒 `GET /api/orders` - Requer token

### 4. **CORS Mais Restritivo**
```python
# Antes: Aceita qualquer origem
allow_origins=["*"]

# Depois: Apenas origens autorizadas
allow_origins=["http://localhost:3000", "https://seu-dominio.com"]
```

Configure em `.env`:
```
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8000,https://seu-dominio.com
```

### 5. **Validação de Input**
- ✅ Email validado com regex
- ✅ Comprimento mínimo/máximo de campos
- ✅ Pydantic models com type hints
- ✅ Sanitização de entrada

### 6. **Proteção Contra Directory Traversal**
```python
# Bloqueia:
GET /../../../etc/passwd
GET /../../.env
GET /.env

# Whitelist de extensões:
ALLOWED_FILE_EXTENSIONS = {
    ".js", ".css", ".html", ".png", ".jpg", 
    ".jpeg", ".ico", ".json", ".svg", ".gif", ".webp"
}
```

### 7. **Tratamento de Erros Seguro**
- ✅ Mensagens de erro genéricas (não expõe detalhes internos)
- ✅ Stack traces apenas em logs, não em resposta
- ✅ Handler global para exceções

```python
# Resposta segura de erro
{
  "success": false,
  "error": "Email ou senha incorretos",
  "status_code": 401
}
```

### 8. **Encoding de Imagens**
Imagens são convertidas para base64:
```python
"imageUrl": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA..."
```

### 9. **Logging Melhorado**
```python
logger.info(f"Login bem-sucedido para: {data.email}")
logger.warning(f"Tentativa de login com email inexistente: {data.email}")
logger.error(f"Erro ao buscar produtos: {str(e)}")
```

### 10. **Variáveis de Ambiente**
Valores sensíveis não estão hardcoded:
```bash
SECRET_KEY=sua-chave-secreta
DATABASE_URL=mssql+pyodbc://...
ALLOWED_ORIGINS=http://localhost:3000
```

---

## 🚀 Como Usar

### 1. **Instalação**
```bash
pip install -r requirements.txt
```

### 2. **Configurar Ambiente**
```bash
cp .env.example .env
# Editar .env com suas configurações
```

### 3. **Gerar Chave Secreta**
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
# Copiar resultado para .env
```

### 4. **Migrar Senhas no Banco**
```python
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Converter senhas existentes
hashed = pwd_context.hash("senha_atual")
print(hashed)  # Usar este valor no banco
```

### 5. **Executar Testes**
```bash
pytest tests/test_main.py -v
```

### 6. **Iniciar Servidor**
```bash
python main.py
# ou
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 7. **Testar API**

#### Health Check (sem autenticação)
```bash
curl http://localhost:8000/api/health
```

#### Login
```bash
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "senha123"
  }'
```

#### Usar Token
```bash
curl http://localhost:8000/api/products \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

---

## 📋 Checklist de Segurança

### Antes de Deploy em Produção

- [ ] Gerar `SECRET_KEY` segura (não usar padrão)
- [ ] Configurar `ALLOWED_ORIGINS` apenas com domínios permitidos
- [ ] Migrar todas as senhas para bcrypt
- [ ] Testar autenticação JWT
- [ ] Configurar HTTPS/SSL
- [ ] Validar `.env` não está no git (adicionar ao `.gitignore`)
- [ ] Executar testes de segurança: `pytest tests/test_main.py -v`
- [ ] Revisar logs de segurança
- [ ] Configurar rate limiting (adicionar no futuro)
- [ ] Configurar CORS corretamente (remover `*`)
- [ ] Validar SQL injection protection (queries parametrizadas)
- [ ] Testar com ferramentas como OWASP ZAP

---

## ⚠️ Vulnerabilidades Corrigidas

### ❌ ANTES
- Senhas em texto plano
- Sem autenticação
- CORS aberto (`*`)
- Directory traversal
- Erros expõem detalhes internos
- SQL injection possível (imports)

### ✅ DEPOIS
- Senhas com bcrypt
- JWT authentication
- CORS restritivo
- Validação de path
- Erros genéricos
- Queries parametrizadas
- Validação de input robusta

---

## 🔗 Referências

- [FastAPI Security](https://fastapi.tiangolo.com/tutorial/security/)
- [Passlib Documentation](https://passlib.readthedocs.io/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Python-Jose Documentation](https://github.com/mpdavis/python-jose)

---

## 📧 Suporte

Para dúvidas sobre segurança, consulte:
- Documentação do FastAPI
- OWASP Security Guidelines
- Abra uma issue no repositório
