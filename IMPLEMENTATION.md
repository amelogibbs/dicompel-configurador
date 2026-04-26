# 🚀 API DICOMPEL v2.0 - Guia de Implementação

## ✨ Principais Mudanças

### Segurança Implementada
- 🔒 **JWT Authentication** - Bearer tokens com expiração
- 🛡️ **Password Hashing** - Bcrypt com salt aleatório
- 🔐 **Protected Routes** - Endpoints requerem autenticação
- 🌐 **CORS Whitelist** - Apenas origens autorizadas
- 📋 **Input Validation** - Pydantic models tipados
- 🚫 **Directory Traversal Protection** - Validação de path
- 🎯 **File Extension Whitelist** - Apenas arquivos permitidos
- 📝 **Secure Error Handling** - Mensagens genéricas

---

## 📦 Arquivos Entregues

```
.
├── main.py                 ✅ API refatorada com segurança
├── requirements.txt        ✅ Dependências pinadas (versões seguras)
├── .env.example           ✅ Template de variáveis de ambiente
├── SECURITY.md            ✅ Guia completo de segurança
├── TEST_REPORT.md         ✅ Relatório de 20 testes
├── run_tests.sh           ✅ Script para executar testes
└── tests/
    └── test_main.py       ✅ Suite completa de testes
```

---

## 🛠️ Instalação e Setup

### 1. Clonar/Atualizar Repositório
```bash
cd dicompel-configurador
git pull origin main
```

### 2. Criar Ambiente Virtual
```bash
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate
```

### 3. Instalar Dependências
```bash
pip install -r requirements.txt
```

### 4. Configurar Variáveis de Ambiente
```bash
cp .env.example .env
```

Editar `.env`:
```env
# Gerar SECRET_KEY única
SECRET_KEY=<run: python -c "import secrets; print(secrets.token_urlsafe(32))">

# Tempo de expiração do token (em minutos)
ACCESS_TOKEN_EXPIRE_MINUTES=60

# Origens CORS permitidas
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8000

# Ambiente
ENVIRONMENT=development

# Porta
PORT=8000
```

### 5. Migrar Senhas no Banco de Dados

**IMPORTANTE:** As senhas existentes devem ser migradas para bcrypt.

```python
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Para cada usuário
senha_original = "123456"  # Senha atual no banco
hashed = pwd_context.hash(senha_original)
print(f"UPDATE usuarios SET senha_hash = '{hashed}' WHERE email = 'user@example.com';")
```

Ou execute um script:
```bash
python -c "
from passlib.context import CryptContext
pwd = CryptContext(schemes=['bcrypt'])
print(pwd.hash('123456'))
"
```

---

## 🧪 Executar Testes

### Todos os Testes
```bash
pytest tests/test_main.py -v
```

### Com Relatório de Coverage
```bash
pytest tests/test_main.py --cov=main --cov-report=html
open htmlcov/index.html
```

### Testes Específicos
```bash
# Apenas testes de segurança
pytest tests/test_main.py::TestPasswordSecurity -v

# Apenas autenticação
pytest tests/test_main.py::TestAuthentication -v

# Apenas validação
pytest tests/test_main.py::TestInputValidation -v
```

### Script Automatizado
```bash
chmod +x run_tests.sh
./run_tests.sh
```

---

## 🚀 Executar a API

### Desenvolvimento (com reload)
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Produção
```bash
python main.py
```

### Com Gunicorn (Recomendado para Produção)
```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:8000 main:app
```

---

## 📡 Testar API

### 1. Health Check (Público)
```bash
curl http://localhost:8000/api/health
```

Resposta:
```json
{
  "status": "ok",
  "message": "API DICOMPEL v2.0 funcionando",
  "timestamp": "2026-04-26T10:30:00"
}
```

### 2. Login (Público)
```bash
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "senha123"
  }'
```

Resposta:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "nome": "João Silva",
    "email": "user@example.com",
    "perfil": "admin"
  }
}
```

### 3. Obter Produtos (Protegido)
```bash
curl http://localhost:8000/api/products \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

### 4. Obter Pedidos (Protegido)
```bash
curl http://localhost:8000/api/orders \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

### Teste com Postman/Insomnia
1. Fazer login para obter token
2. Adicionar header: `Authorization: Bearer {token}`
3. Fazer requisições protegidas

---

## 🔐 Checklist de Segurança Antes de Deploy

- [ ] `SECRET_KEY` configurada com valor único
- [ ] `.env` NÃO está versionado (adicionar ao `.gitignore`)
- [ ] Senhas do banco migradas para bcrypt
- [ ] `ALLOWED_ORIGINS` configurado com domínios reais
- [ ] HTTPS/SSL ativado em produção
- [ ] Todos os testes passando: `pytest tests/test_main.py -v`
- [ ] Variáveis de ambiente em produção/staging
- [ ] Rate limiting configurado (opcional: `slowapi`)
- [ ] Backup do banco de dados
- [ ] Logging de auditoria habilitado
- [ ] Monitoramento e alertas configurados

---

## 📊 Estrutura de Resposta Padronizada

### Sucesso (2xx)
```json
{
  "success": true,
  "data": {...}
}
```

### Erro (4xx/5xx)
```json
{
  "success": false,
  "error": "Mensagem de erro genérica",
  "status_code": 400
}
```

---

## 🔄 Fluxo de Autenticação

```
1. USER
   ↓
   POST /api/login (email + senha)
   ↓
2. API
   - Valida entrada (Pydantic)
   - Busca usuário no banco
   - Verifica senha com bcrypt
   - Gera JWT token
   ↓
3. USER recebe token
   ↓
4. USER faz requisição protegida
   GET /api/products
   Header: Authorization: Bearer {token}
   ↓
5. API
   - Verifica token (verify_token)
   - Decodifica JWT
   - Retorna dados se válido
   ↓
6. USER recebe dados
```

---

## 🐛 Troubleshooting

### Token Expirado
```
Erro: "Token expirado ou inválido"
Solução: Fazer login novamente para obter novo token
```

### Senha Incorreta após Migração
```
Erro: "Email ou senha incorretos"
Solução: Verificar se senha foi hasheada corretamente no banco
```

### CORS Error
```
Erro: "Access-Control-Allow-Origin missing"
Solução: Adicionar origem ao ALLOWED_ORIGINS em .env
```

### Arquivo não Encontrado
```
Erro: 404 em arquivo estático
Solução: Verificar se frontend/dist/assets está presente
```

---

## 📚 Documentação Adicional

- `SECURITY.md` - Detalhes completos de segurança
- `TEST_REPORT.md` - Relatório de 20 testes
- [FastAPI Docs](https://fastapi.tiangolo.com)
- [OWASP Security](https://owasp.org)

---

## 🆘 Suporte

Para problemas:
1. Consulte `SECURITY.md` e `TEST_REPORT.md`
2. Verifique logs: `tail -f app.log`
3. Execute testes: `pytest tests/test_main.py -v`
4. Abra issue no GitHub

---

## 📝 Resumo de Mudanças

| Aspecto | Antes | Depois |
|---------|-------|--------|
| **Autenticação** | ❌ Nenhuma | ✅ JWT Bearer |
| **Senhas** | ❌ Texto plano | ✅ Bcrypt |
| **CORS** | ❌ Aberto (*) | ✅ Whitelist |
| **Validação** | ❌ Fraca | ✅ Pydantic |
| **Directory Traversal** | ❌ Vulnerável | ✅ Protegido |
| **Testes** | ❌ Nenhum | ✅ 20 testes |
| **Documentação** | ❌ Mínima | ✅ Completa |

---

**Versão:** 2.0.0  
**Status:** ✅ PRONTO PARA PRODUÇÃO  
**Data:** 2026-04-26
