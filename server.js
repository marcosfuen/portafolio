
import dotenv from 'dotenv';
import express from 'express';
import pg from 'pg';
import cors from 'cors';
import crypto from 'crypto';

dotenv.config();
const { Pool } = pg;
const app = express();

app.use(cors());
app.use(express.json());

// Grano de sal para la encriptación
const PASSWORD_SALT = 'portfolio_pro_salt_99';

// Función para encriptar con MD5 + Salt
const hashPassword = (password) => {
  return crypto.createHash('md5').update(password + PASSWORD_SALT).digest('hex');
};

const poolConfig = process.env.DATABASE_URL 
  ? { connectionString: process.env.DATABASE_URL }
  : {
      user: process.env.DB_USER || 'postgres',
      host: process.env.DB_HOST || 'localhost',
      database: process.env.DB_DATABASE || 'portfolio_db',
      password: process.env.DB_PASSWORD || 'postgres',
      port: parseInt(process.env.DB_PORT) || 5432,
    };

const pool = new Pool({
  ...poolConfig,
  ssl: process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('localhost') 
    ? { rejectUnauthorized: false } 
    : false,
});

const initDb = async () => {
  let client;
  try {
    client = await pool.connect();
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        email TEXT,
        role TEXT DEFAULT 'VIEWER',
        status TEXT DEFAULT 'ACTIVE',
        last_login TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS profile (
        id SERIAL PRIMARY KEY,
        name TEXT,
        role JSONB,
        bio JSONB,
        avatar TEXT,
        cv_url TEXT,
        email TEXT,
        github TEXT,
        linkedin TEXT,
        theme TEXT DEFAULT 'MODERN'
      );
      
      -- Check for missing columns in migration
      DO $$ 
      BEGIN 
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profile' AND column_name='cv_url') THEN
          ALTER TABLE profile ADD COLUMN cv_url TEXT;
        END IF;
      END $$;

      CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        title JSONB,
        description JSONB,
        long_description JSONB,
        image TEXT,
        tags TEXT[],
        link TEXT
      );
      CREATE TABLE IF NOT EXISTS skills (
        id TEXT PRIMARY KEY,
        name TEXT,
        level INTEGER,
        category TEXT
      );
      CREATE TABLE IF NOT EXISTS work_experience (
        id TEXT PRIMARY KEY,
        role JSONB,
        company TEXT,
        location TEXT,
        dates TEXT,
        description JSONB,
        order_index SERIAL
      );
    `);
    
    const userRes = await client.query('SELECT COUNT(*) FROM users');
    if (parseInt(userRes.rows[0].count) === 0) {
      const hashedDefault = hashPassword('password');
      await client.query("INSERT INTO users (id, username, password, email, role, status) VALUES ('u1', 'admin', $1, 'admin@pro-portfolio.com', 'ADMIN', 'ACTIVE')", [hashedDefault]);
    }

    const profileRes = await client.query('SELECT COUNT(*) FROM profile');
    if (parseInt(profileRes.rows[0].count) === 0) {
      await client.query(`
        INSERT INTO profile (name, role, bio, avatar, cv_url, email, github, linkedin, theme)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        ['Alex Dev', { es: 'Ingeniero Full-Stack', en: 'Full-Stack Engineer' }, { es: 'Bio...', en: 'Bio...' }, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400', '', 'alex@example.com', '#', '#', 'MODERN']
      );
    }
  } catch (err) {
    console.error('DB Init Error:', err.message);
  } finally {
    if (client) client.release();
  }
};
initDb();

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const hashedInput = hashPassword(password);
    const result = await pool.query('SELECT id, username, role, status FROM users WHERE username = $1 AND password = $2', [username, hashedInput]);
    
    if (result.rows.length > 0) {
      const user = result.rows[0];
      
      if (user.status === 'INACTIVE') {
        return res.status(403).json({ error: 'Acceso denegado: Tu cuenta ha sido desactivada por un administrador.' });
      }
      if (user.status === 'SUSPENDED') {
        return res.status(403).json({ error: 'Acceso denegado: Tu cuenta ha sido suspendida.' });
      }
      
      await pool.query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id]);
      res.json(user);
    } else {
      res.status(401).json({ error: 'Error de autenticación: El nombre de usuario o la contraseña son incorrectos.' });
    }
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, username, email, role, status, last_login as "lastLogin", created_at as "createdAt" FROM users ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/users', async (req, res) => {
  const { id, username, password, email, role, status } = req.body;
  try {
    const hashedPassword = hashPassword(password);
    const result = await pool.query('INSERT INTO users (id, username, password, email, role, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, username, role, status', [id, username, hashedPassword, email, role, status || 'ACTIVE']);
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  const { username, email, role, status, password } = req.body;
  try {
    let query, values;
    if (password && password.trim() !== '') {
      const hashedPassword = hashPassword(password);
      query = 'UPDATE users SET username=$1, email=$2, role=$3, status=$4, password=$5 WHERE id=$6 RETURNING id, username, role, status';
      values = [username, email, role, status, hashedPassword, id];
    } else {
      query = 'UPDATE users SET username=$1, email=$2, role=$3, status=$4 WHERE id=$5 RETURNING id, username, role, status';
      values = [username, email, role, status, id];
    }
    const result = await pool.query(query, values);
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/users/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM users WHERE id = $1', [req.params.id]);
    res.sendStatus(204);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/portfolio', async (req, res) => {
  try {
    const profile = await pool.query('SELECT * FROM profile LIMIT 1');
    const projects = await pool.query('SELECT * FROM projects');
    const skills = await pool.query('SELECT * FROM skills');
    const work = await pool.query('SELECT * FROM work_experience ORDER BY order_index DESC');
    res.json({
      ...(profile.rows[0] || {}),
      cvUrl: profile.rows[0]?.cv_url || '',
      projects: projects.rows.map(p => ({ ...p, longDescription: p.long_description })),
      skills: skills.rows,
      workExperience: work.rows
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/profile', async (req, res) => {
  const allowedFieldsMapping = {
    name: 'name',
    role: 'role',
    bio: 'bio',
    email: 'email',
    github: 'github',
    linkedin: 'linkedin',
    theme: 'theme',
    avatar: 'avatar',
    cvUrl: 'cv_url'
  };
  
  const updates = [];
  const values = [];
  
  Object.keys(allowedFieldsMapping).forEach((frontendKey) => {
    const dbKey = allowedFieldsMapping[frontendKey];
    if (req.body[frontendKey] !== undefined) {
      updates.push(`${dbKey}=$${updates.length + 1}`);
      values.push(req.body[frontendKey]);
    }
  });

  if (updates.length === 0) return res.json({});
  try {
    const query = `UPDATE profile SET ${updates.join(', ')} WHERE id = (SELECT id FROM profile LIMIT 1) RETURNING *`;
    const result = await pool.query(query, values);
    res.json({
        ...result.rows[0],
        cvUrl: result.rows[0].cv_url
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Proyectos Endpoints
app.post('/api/projects', async (req, res) => {
  const { id, title, description, longDescription, image, tags, link } = req.body;
  try {
    const result = await pool.query('INSERT INTO projects (id, title, description, long_description, image, tags, link) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *', [id, title, description, longDescription, image, tags, link]);
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/projects/:id', async (req, res) => {
  const { title, description, longDescription, image, tags, link } = req.body;
  const { id } = req.params;
  try {
    const result = await pool.query(
      'UPDATE projects SET title=$1, description=$2, long_description=$3, image=$4, tags=$5, link=$6 WHERE id=$7 RETURNING *',
      [title, description, longDescription, image, tags, link, id]
    );
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/projects/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM projects WHERE id = $1', [req.params.id]);
    res.sendStatus(204);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Skills Endpoints
app.post('/api/skills', async (req, res) => {
  const { id, name, level, category } = req.body;
  try {
    const result = await pool.query('INSERT INTO skills (id, name, level, category) VALUES ($1, $2, $3, $4) RETURNING *', [id, name, level, category]);
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/skills/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM skills WHERE id = $1', [req.params.id]);
    res.sendStatus(204);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Work Experience Endpoints
app.post('/api/experience', async (req, res) => {
  const { id, role, company, location, dates, description } = req.body;
  try {
    const result = await pool.query('INSERT INTO work_experience (id, role, company, location, dates, description) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *', [id, role, company, location, dates, description]);
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/experience/:id', async (req, res) => {
  const { role, company, location, dates, description } = req.body;
  const { id } = req.params;
  try {
    const result = await pool.query(
      'UPDATE work_experience SET role=$1, company=$2, location=$3, dates=$4, description=$5 WHERE id=$6 RETURNING *',
      [role, company, location, dates, description, id]
    );
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/experience/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM work_experience WHERE id = $1', [req.params.id]);
    res.sendStatus(204);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/system/health', async (req, res) => {
  const start = Date.now();
  try {
    await pool.query('SELECT 1');
    const latency = Date.now() - start;
    res.json({ api: 'online', database: 'online', gemini: process.env.API_KEY ? 'configured' : 'missing', latency });
  } catch (err) {
    res.status(500).json({ api: 'online', database: 'offline', error: err.message });
  }
});

app.get('/api/health', (req, res) => res.json({ status: 'connected' }));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`API on ${PORT}`));
