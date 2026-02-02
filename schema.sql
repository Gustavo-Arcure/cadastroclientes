PRAGMA foreign_keys = ON;

/* =========================
   USUÁRIOS
========================= */
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    login TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT CHECK(role IN ('funcionario','gerente')) NOT NULL,
    active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

/* =========================
   PRODUTOS
========================= */
CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    barcode TEXT UNIQUE,
    price REAL NOT NULL,
    active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

/* =========================
   ESTOQUE ATUAL
========================= */
CREATE TABLE IF NOT EXISTS stock (
    product_id INTEGER PRIMARY KEY,
    quantity INTEGER DEFAULT 0,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id)
);

/* =========================
   HISTÓRICO DE ESTOQUE (IMUTÁVEL)
========================= */
CREATE TABLE IF NOT EXISTS stock_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    old_quantity INTEGER,
    new_quantity INTEGER,
    reason TEXT,
    user_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

/* =========================
   VENDAS
========================= */
CREATE TABLE IF NOT EXISTS sales (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price REAL NOT NULL,
    total REAL NOT NULL,
    user_id INTEGER,
    day DATE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

/* =========================
   CONTROLE DE DIA
========================= */
CREATE TABLE IF NOT EXISTS day_control (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    day DATE UNIQUE NOT NULL,
    opened_at DATETIME,
    closed_at DATETIME,
    closed INTEGER DEFAULT 0
);

/* =========================
   RELATÓRIO DIÁRIO (IMUTÁVEL)
========================= */
CREATE TABLE IF NOT EXISTS day_reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    day DATE UNIQUE NOT NULL,
    total_sales REAL,
    total_items INTEGER,
    generated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

/* =========================
   ANOTAÇÕES / INTERCORRÊNCIAS
========================= */
CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content TEXT NOT NULL,
    day DATE NOT NULL,
    user_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

/* =========================
   LOG DE AÇÕES (AUDITORIA)
========================= */
CREATE TABLE IF NOT EXISTS logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    action TEXT NOT NULL,
    user_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

/* =========================
   PREFERÊNCIAS DE USUÁRIO
========================= */
CREATE TABLE IF NOT EXISTS user_preferences (
    user_id INTEGER PRIMARY KEY,
    theme TEXT,
    font TEXT,
    font_size INTEGER,
    primary_color TEXT,
    night_mode INTEGER DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
