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
    cookie: { secure: false, maxAge: 1000 * 60 * 60 } // 1 hora
}));

// Servir archivos estáticos del frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// Rutas
app.use('/auth',          require('./routes/auth'));
app.use('/transacciones', require('./routes/transacciones'));
app.use('/balance',       require('./routes/balance'));
app.use('/categorias',    require('./routes/categorias'));
app.use('/auditoria',     require('./routes/auditoria'));
app.use('/perfiles',      require('./routes/perfiles'));

// Iniciar servidor
app.listen(3000, () => {
    console.log('Servidor corriendo en http://localhost:3000');
});