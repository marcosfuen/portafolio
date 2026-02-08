
-- ==========================================
-- ESQUEMA DE BASE DE DATOS: PRO-PORTFOLIO
-- Motor: PostgreSQL 15+
-- ==========================================

-- 1. Tabla de Usuarios (Autenticación y Roles)
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,                       -- ID único (ej: u123456)
    username TEXT UNIQUE NOT NULL,             -- Nombre de usuario único
    password TEXT NOT NULL,                    -- Contraseña (se recomienda hashear en prod)
    role TEXT DEFAULT 'VIEWER',                -- Roles: 'ADMIN', 'EDITOR', 'VIEWER'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabla de Perfil (Información General y Configuración)
CREATE TABLE IF NOT EXISTS profile (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL DEFAULT 'Alex Dev',
    role JSONB NOT NULL,                       -- Formato: {"es": "...", "en": "..."}
    bio JSONB NOT NULL,                        -- Formato: {"es": "...", "en": "..."}
    avatar TEXT,                               -- URL de la imagen de perfil
    email TEXT,
    github TEXT,
    linkedin TEXT,
    theme TEXT DEFAULT 'MODERN',               -- Enum: 'MODERN', 'DARK', 'CYBERPUNK', etc.
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabla de Proyectos (Casos de estudio)
CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    title JSONB NOT NULL,                      -- Formato: {"es": "...", "en": "..."}
    description JSONB NOT NULL,                -- Formato: {"es": "...", "en": "..."}
    long_description JSONB,                    -- Formato: {"es": "...", "en": "..."}
    image TEXT,                                -- URL de imagen principal
    tags TEXT[],                               -- Array de strings (ej: ['React', 'Node'])
    link TEXT,                                 -- URL del proyecto en vivo
    order_index SERIAL,                        -- Para ordenar los proyectos manualmente
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Tabla de Habilidades (Skills)
CREATE TABLE IF NOT EXISTS skills (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    level INTEGER CHECK (level >= 0 AND level <= 100), -- Nivel de 0 a 100
    category TEXT NOT NULL,                    -- Enum: 'Frontend', 'Backend', 'Design', 'Others'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indices para optimización de búsqueda
CREATE INDEX IF NOT EXISTS idx_projects_tags ON projects USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- Comentarios de documentación
COMMENT ON TABLE profile IS 'Almacena la configuración global y datos del dueño del portafolio';
COMMENT ON COLUMN profile.role IS 'Objeto JSON con traducciones del cargo profesional';
COMMENT ON COLUMN projects.tags IS 'Lista de tecnologías utilizadas en el proyecto';
