# 🚀 Guia de Publicação do DashMaster no Render

Este guia vai te levar do zero ao site no ar em cerca de 10-15 minutos.

## Pré-requisitos
- Uma conta no [Render.com](https://dashboard.render.com/register) (pode usar o GitHub/Google).
- O código do seu projeto já deve estar no GitHub/GitLab.

---

## Passo 1: O Banco de Dados (PostgreSQL)

Como o Render apaga arquivos locais quando reinicia, precisamos de um banco profissional.

1. No Dashboard do Render, clique em **New +** > **PostgreSQL**.
2. **Name**: `dashmaster-db`
3. **Region**: Escolha a mais próxima (ex: `Ohio (US East)`).
4. **PostgreSQL Version**: Pode deixar a padrão (16 ou 15).
5. **Instance Type**: `Free` (Gratuito).
6. Clique em **Create Database**.

🛑 **PAUSE E AGUARDE**: Leva uns 2 minutos para ficar "Available".
Assim que ficar pronto:
1. Vá na seção **Connections**.
2. Copie a **Internal Database URL** (começa com `postgres://...`). Vamos chamar de **`DB_INTERNAL_URL`**.

---

## Passo 2: O Site (Web Service)

1. No Dashboard, clique em **New +** > **Web Service**.
2. Conecte seu repositório do GitHub (`dashmaster`).
3. Preencha os dados:
   - **Name**: `dashmaster-app`
   - **Region**: A MESMA do banco de dados (ex: `Ohio`).
   - **Branch**: `main` (ou a branch que você está usando).
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn src.main:app --host 0.0.0.0 --port 10000`
   - **Instance Type**: `Free`.

4. **Variáveis de Ambiente (Environment Variables)**:
   Clique em **Advanced** ou role até **Environment Variables** e adicione:

   | Key | Value |
   | :--- | :--- |
   | `PYTHON_VERSION` | `3.11.9` |
   | `DATABASE_URL` | Cole a **`DB_INTERNAL_URL`** que você copiou do banco. |
   | `SECRET_KEY` | Invente uma senha longa e segura (letras/numeros). |
   | `GOOGLE_CREDENTIALS_JSON` | **Abra seu arquivo `credentials/service_account.json` no bloco de notas, copie TODO o conteúdo e cole aqui.** |

5. Clique em **Create Web Service**.

---

## Passo 3: Testar

O Render vai começar o "Build". Pode levar uns 5 minutos na primeira vez.
Acompanhe os logs. Se aparecer `Application startup complete`, DEU CERTO! 🎉

1. Clique na URL do seu site (algo como `https://dashmaster-app.onrender.com`).
2. Tente fazer Login (Lembre-se: O banco é NOVO, seu usuário local não existe lá. Clique em **Registrar** ou crie um usuário novo).
3. Teste criar um projeto.

---

## Solução de Problemas Comuns

- **Erro "Internal Server Error" ao abrir o site**:
  - Verifique os Logs no Render.
  - Geralmente é a `DATABASE_URL` errada ou faltou a `SECRET_KEY`.

- **Erro de Google Sheets**:
  - Verifique se copiou o JSON *inteiro* para a variável `GOOGLE_CREDENTIALS_JSON`. Não pode faltar chaves `{ }`.
