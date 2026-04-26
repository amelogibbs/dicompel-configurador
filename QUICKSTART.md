# 🚀 Guia Rápido - Iniciar a API DICOMPEL v2.0

## ⚡ 5 Minutos para Rodar Tudo

### 1️⃣ **Clone ou Atualize o Repositório**

```bash
# Se já tem a pasta
cd dicompel-configurador
git pull origin main

# Se não tem
git clone https://github.com/amelogibbs/dicompel-configurador.git
cd dicompel-configurador
```

---

### 2️⃣ **Criar Ambiente Virtual**

```bash
# Criar
python -m venv venv

# Ativar
# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate
```

---

### 3️⃣ **Instalar Dependências**

```bash
pip install -r requirements.txt
```

---

### 4️⃣ **Configurar Variáveis de Ambiente**

```bash
cp .env.example .env
```

Editar `.env` e adicionar:
```env
SECRET_KEY=sua-chave-secreta-aqui-mude-em-producao
ACCESS_TOKEN_EXPIRE_MINUTES=60
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8000
PORT=8000
```

> **Gerar SECRET_KEY:**
> ```bash
> python -c "import secrets; print(secrets.token_urlsafe(32))"
> ```

---

### 5️⃣ **Rodar a API**

```bash
python main.py
```

Você verá:
```
🚀 Iniciando API DICOMPEL v2.0
📍 Host: 0.0.0.0:8000
🔓 CORS permitidas: ['http://localhost:3000', 'http://localhost:8000']
📚 Docs em: http://localhost:8000/docs
```

---

## 🌐 **Testar a API**

### **Opção 1: Página Interativa (Recomendado)**

```bash
# Abrir no navegador
open api_test_interface.html  # macOS
# ou
start api_test_interface.html  # Windows
# ou
firefox api_test_interface.html  # Linux
```

---

### **Opção 2: Teste via Terminal**

#### Health Check
```bash
curl http://localhost:8000/api/health
```

#### Login (Obter Token)
```bash
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@dicompel.com",
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
    "nome": "Admin DICOMPEL",
    "email": "admin@dicompel.com",
    "perfil": "admin"
  }
}
```

#### Listar Produtos (Com Token)
```bash
# Substitua SEU_TOKEN pelo token recebido acima
curl http://localhost:8000/api/products \
  -H "Authorization: Bearer SEU_TOKEN"
```

#### Listar Pedidos (Com Token)
```bash
curl http://localhost:8000/api/orders \
  -H "Authorization: Bearer SEU_TOKEN"
```

---

### **Opção 3: Usar Postman/Insomnia**

1. Importar coleção:
```json
{
  "info": {
    "name": "DICOMPEL API v2.0"
  },
  "item": [
    {
      "name": "Health",
      "request": {
        "method": "GET",
        "url": "http://localhost:8000/api/health"
      }
    },
    {
      "name": "Login",
      "request": {
        "method": "POST",
        "url": "http://localhost:8000/api/login",
        "body": {
          "email": "admin@dicompel.com",
          "password": "senha123"
        }
      }
    }
  ]
}
```

---

## 📊 **Usuários de Teste**

```
Email: admin@dicompel.com
Senha: senha123
Perfil: admin

ou

Email: user@dicompel.com
Senha: senha123
Perfil: user
```

---

## 🧪 **Executar Testes**

```bash
# Todos os testes
pytest tests/test_main.py -v

# Apenas testes de segurança
pytest tests/test_main.py::TestPasswordSecurity -v

# Com coverage
pytest tests/test_main.py --cov=main
```

---

## 📚 **Documentação Interativa**

Acesse em seu navegador:
```
http://localhost:8000/docs
```

Lá você pode:
- ✅ Ver todas as rotas
- ✅ Testar requisições
- ✅ Ver respostas esperadas
- ✅ Explorar modelos Pydantic

---

## ⚠️ **Troubleshooting**

### **Erro: ModuleNotFoundError**
```bash
pip install -r requirements.txt
```

### **Erro: Secret key not found**
```bash
# Gerar novo
python -c "import secrets; print(secrets.token_urlsafe(32))"

# Copiar para .env
SECRET_KEY=seu-valor-aqui
```

### **Erro: CORS bloqueado**
```bash
# Verificar ALLOWED_ORIGINS em .env
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8000
```

### **Erro: Porta 8000 em uso**
```bash
# Mudar porta em .env
PORT=8001

# Ou encerrar processo
lsof -i :8000
kill -9 PID
```

---

## 🔐 **Migração de Banco de Dados**

Se você tem um banco de dados real com usuários:

```python
from passlib.context import CryptContext

pwd = CryptContext(schemes=["bcrypt"])

# Converter senha antiga para bcrypt
hashed = pwd.hash("senha_original")
print(f"UPDATE usuarios SET senha_hash = '{hashed}' WHERE id = 1;")
```

Depois executar no banco de dados:
```sql
UPDATE usuarios SET senha_hash = '$2b$12$...' WHERE email = 'usuario@example.com';
```

---

## 📈 **Estrutura do Projeto**

```
dicompel-configurador/
├── main.py                    # API refatorada (v2.0)
├── requirements.txt           # Dependências
├── .env.example              # Template .env
├── api_test_interface.html   # Página de teste
├── SECURITY.md               # Guia de segurança
├── IMPLEMENTATION.md         # Guia de implementação
├── TEST_REPORT.md           # Relatório de testes
├── tests/
│   └── test_main.py         # 20 testes de segurança
└── frontend/
    └── dist/
        └── (arquivos do frontend)
```

---

## ✅ **Checklist de Deploy**

- [ ] `pip install -r requirements.txt` ✅
- [ ] `.env` configurado ✅
- [ ] `SECRET_KEY` única gerada ✅
- [ ] `ALLOWED_ORIGINS` correto ✅
- [ ] Testes passando: `pytest tests/test_main.py -v` ✅
- [ ] API rodando: `python main.py` ✅
- [ ] Página interativa abrindo ✅
- [ ] Login funcionando ✅
- [ ] Produtos retornando (com token) ✅
- [ ] Pedidos retornando (com token) ✅

---

## 🎯 **Próximos Passos**

1. ✅ Rodar localmente e testar
2. ✅ Migrar senhas do banco para bcrypt
3. ✅ Configurar banco de dados real
4. ✅ Deploy em produção com HTTPS
5. ✅ Configurar rate limiting
6. ✅ Adicionar monitoramento

---

## 📞 **Suporte**

Dúvidas? Consulte:
- `SECURITY.md` - Detalhes de segurança
- `IMPLEMENTATION.md` - Setup completo
- `TEST_REPORT.md` - Relatório de testes
- Documentação interativa: `http://localhost:8000/docs`

---

**Tudo pronto! Comece a testar! 🚀**
