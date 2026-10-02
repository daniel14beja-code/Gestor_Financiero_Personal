const express = require('express');
const cors = require('cors');
const session = require('express-session');
const path = require('path');

const app = express();

// Middlewares
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Sesiones
app.use(session({
    secret: 'gestorf_secret_2026',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 1000 * 60 * 60 }
}));

// ← RUTAS PRIMERO, ANTES de los archivos estáticos
app.use('/auth',          require('./routes/auth'));
app.use('/transacciones', require('./routes/transacciones'));
app.use('/balance',       require('./routes/balance'));
app.use('/categorias',    require('./routes/categorias'));
app.use('/auditoria',     require('./routes/auditoria'));
app.use('/perfiles',      require('./routes/perfiles'));
app.use('/usuarios',      require('./routes/usuarios'));

// ← ARCHIVOS ESTÁTICOS AL FINAL
app.use(express.static(path.join(__dirname, '../frontend')));

// Iniciar servidor
app.listen(3000, () => {
    console.log('Servidor corriendo en http://localhost:3000');
});