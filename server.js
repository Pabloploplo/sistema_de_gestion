const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});

// Habilitar middleware para JSON
app.use(express.json());
app.use(express.static('public'));

// Crear y conectar base de datos
const dbPath = process.env.NODE_ENV === 'production' ? './production.db' : './inventory.db';
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error al conectar con la base de datos:', err);
    } else {
        console.log(`Conexión exitosa a la base de datos en: ${dbPath}`);
        
        // ... resto del código ...
    }
});
        
        // Crear tablas al iniciar
        db.serialize(() => {
            // Tabla usuarios
            db.run(`
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    username TEXT UNIQUE,
                    password TEXT
                )
            `, (err) => {
                if (err) {
                    console.error('Error al crear tabla users:', err);
                } else {
                    console.log('Tabla users creada o ya existe');
                    
                    // Insertar usuario de prueba
                    db.run(`
                        INSERT OR IGNORE INTO users (username, password) 
                        VALUES (?, ?)
                    `, ['admin', 'admin123'], (err) => {
                        if (err) {
                            console.error('Error al crear usuario admin:', err);
                        } else {
                            console.log('Usuario admin creado o ya existe');
                        }
                    });
                }
            });

            // Tabla logs
            db.run(`
                CREATE TABLE IF NOT EXISTS access_logs (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    username TEXT,
                    action TEXT,
                    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                    ip_address TEXT,
                    status TEXT
                )
            `, (err) => {
                if (err) {
                    console.error('Error al crear tabla access_logs:', err);
                } else {
                    console.log('Tabla access_logs creada o ya existe');
                }
            });
        });
    }
});

// Ruta POST para login
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    console.log('Intento de login:', { username, password });

    db.get(
        'SELECT * FROM users WHERE username = ? AND password = ?',
        [username, password],
        (err, user) => {
            if (err) {
                console.error('Error en consulta de login:', err);
                return res.status(500).json({ 
                    success: false, 
                    message: 'Error en el servidor' 
                });
            }

            if (user) {
                // Login exitoso - registrar en logs
                db.run(
                    'INSERT INTO access_logs (username, action, ip_address, status) VALUES (?, ?, ?, ?)',
                    [username, 'login', req.ip, 'success'],
                    (err) => {
                        if (err) {
                            console.error('Error al registrar log exitoso:', err);
                        }
                        console.log('Login exitoso registrado para:', username);
                    }
                );

                res.json({ success: true });
            } else {
                // Login fallido - registrar en logs
                db.run(
                    'INSERT INTO access_logs (username, action, ip_address, status) VALUES (?, ?, ?, ?)',
                    [username, 'login_attempt', req.ip, 'failed'],
                    (err) => {
                        if (err) {
                            console.error('Error al registrar log fallido:', err);
                        }
                        console.log('Intento fallido registrado para:', username);
                    }
                );

                res.json({ 
                    success: false, 
                    message: 'Usuario o contraseña incorrectos' 
                });
            }
        }
    );
});

// Ruta GET para ver logs
app.get('/api/logs', (req, res) => {
    db.all('SELECT * FROM access_logs ORDER BY timestamp DESC', [], (err, rows) => {
        if (err) {
            console.error('Error al obtener logs:', err);
            return res.status(500).json({ 
                success: false, 
                error: err.message 
            });
        }
        console.log('Logs recuperados:', rows.length);
        res.json(rows);
    });
});






// ... (código existente) ...

// Rutas para Entradas
app.post('/api/entradas', (req, res) => {
    const { producto, cantidad, estado } = req.body;
    db.run('INSERT INTO entradas (producto, cantidad, estado) VALUES (?, ?, ?)',
        [producto, cantidad, estado],
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ id: this.lastID });
        });
});

app.put('/api/entradas/:id', (req, res) => {
    const { producto, cantidad, estado } = req.body;
    db.run('UPDATE entradas SET producto = ?, cantidad = ?, estado = ? WHERE id = ?',
        [producto, cantidad, estado, req.params.id],
        (err) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ success: true });
        });
});

app.delete('/api/entradas/:id', (req, res) => {
    db.run('DELETE FROM entradas WHERE id = ?', req.params.id, (err) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ success: true });
    });
});

// Rutas similares para Asignaciones y Mermas
// ...











// Ruta para página de logs
app.get('/logs', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'logs.html'));
});

// Iniciar servidor
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});