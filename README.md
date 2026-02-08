# 🚀 ProPortfolio & CMS (Gemini + PostgreSQL)

Este es un portafolio profesional de alto impacto que incluye un sistema de gestión de contenidos (CMS) administrativo, persistencia en base de datos PostgreSQL y optimización de textos mediante Inteligencia Artificial (Google Gemini).

## 🛠️ Tecnologías Principales
- **Frontend:** React 19, Tailwind CSS, Vite, Lucide React, Recharts.
- **Backend:** Node.js, Express.
- **Base de Datos:** PostgreSQL.
- **IA:** Google Gemini API (`@google/genai`).

---

## 💻 Guía de Instalación Local

### 1. Requisitos Previos
- **Node.js** (v18 o superior).
- **PostgreSQL** instalado y corriendo en tu máquina.
- Una **API Key de Gemini** (Consíguela gratis en [Google AI Studio](https://aistudio.google.com/)).

### 2. Clonar y Configurar
1. Descarga o clona el repositorio.
2. Abre una terminal en la carpeta raíz y ejecuta:
   ```bash
   npm install
   ```
3. Crea un archivo llamado `.env` en la raíz (puedes copiar el contenido de `.env` que se encuentra en el proyecto) y ajusta tus credenciales:
   ```env
   DATABASE_URL=postgres://tu_usuario:tu_password@localhost:5432/portfolio_db
   API_KEY=tu_clave_de_gemini_aqui
   PORT=3001
   ```

### 3. Inicializar la Base de Datos
Asegúrate de que tu base de datos `portfolio_db` exista. El servidor está configurado para crear las tablas automáticamente al iniciar (`initDb`), pero puedes ejecutar manualmente el contenido de `schema.sql` en tu cliente de Postgres (pgAdmin, DBeaver o psql) para asegurar la estructura.

### 4. Ejecutar el Proyecto
Para correr el backend y el frontend simultáneamente:
```bash
npm run dev
```
- **Frontend:** `http://localhost:5173`
- **Backend API:** `http://localhost:3001`

---

## 🌐 Guía de Despliegue Gratuito

Para tener tu portafolio en internet sin pagar nada, sigue esta combinación ganadora:

### 1. Base de Datos (Neon.tech)
1. Regístrate en [Neon.tech](https://neon.tech/) (PostgreSQL Serverless gratuito).
2. Crea un proyecto y copia la **Connection String**.
3. Esta URL será tu variable `DATABASE_URL` en producción.

### 2. Backend (Render.com)
1. Sube tu código a un repositorio en **GitHub**.
2. Crea un nuevo **Web Service** en Render.
3. Conecta tu repositorio.
4. Configura los comandos:
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
5. En la sección **Environment**, añade:
   - `DATABASE_URL`: (La URL de Neon).
   - `API_KEY`: (Tu clave de Gemini).
   - `NODE_ENV`: `production`

### 3. Frontend (Vercel)
1. Crea un nuevo proyecto en **Vercel** e importa el mismo repositorio de GitHub.
2. Vercel detectará automáticamente que es un proyecto **Vite**.
3. En **Environment Variables**, añade:
   - `VITE_API_URL`: (La URL que te asignó Render, ej: `https://mi-backend.onrender.com`).
4. ¡Despliega!

---

## 🔑 Acceso Administrativo
Una vez desplegado o corriendo localmente, puedes acceder al panel de control:
1. Ve a la URL de tu sitio y añade `#admin` al final (ej: `http://localhost:5173/#admin`).
2. **Credenciales por defecto:**
   - **Usuario:** `admin`
   - **Contraseña:** `password`
3. *Se recomienda cambiar la contraseña inmediatamente desde la gestión de usuarios.*

## ✨ Características Especiales
- **Gemini AI Integration:** En el panel de perfil y proyectos, verás un botón de "Mejorar con IA". Esto enviará tu texto actual a Gemini para devolver una versión más profesional y atractiva.
- **Temas Dinámicos:** Cambia el aspecto visual de todo el sitio con un solo clic desde la sección "Temas".
- **Multi-idioma:** Soporte nativo para Español e Inglés en todo el contenido público.

---
**Desarrollado con ❤️ para profesionales del desarrollo.**