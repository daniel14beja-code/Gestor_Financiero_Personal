const express = require('express');
const router = express.Router();
const db = require('../db');
const crypto = require('crypto');

function md5(text) {
    return crypto.createHash('md5').update(text).digest('hex');
}

// Login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const [rows] = await db.query(
            'SELECT u.*, p.perfil FROM usuarios u JOIN perfiles p ON u.id_perfil = p.id_perfil WHERE u.username=? AND u.password_hash=? AND u.estado="activo"',
            [username, md5(password)]
        );
        if (rows.length > 0) {
            req.session.usuario = {
                id: rows[0].id_usuario,
                nombre: rows[0].nombre + ' ' + rows[0].apellido,
                username: rows[0].username,
                perfil: rows[0].perfil,
                idPerfil: rows[0].id_perfil
            };
            res.json({ ok: true, usuario: req.session.usuario });
        } else {
            res.json({ ok: false, mensaje: 'Usuario o contraseña incorrectos' });
        }
    } catch (e) {
        res.status(500).json({ ok: false, mensaje: e.message });
    }
});

// Registro
router.post('/registro', async (req, res) => {
    try {
        const { nombre, apellido, username, password } = req.body;
        const [existe] = await db.query('SELECT id_usuario FROM usuarios WHERE username=?', [username]);
        if (existe.length > 0) {
            return res.json({ ok: false, mensaje: 'Ese usuario ya existe' });
        }
        const [result] = await db.query(
            'INSERT INTO usuarios (nombre, apellido, id_perfil, username, password_hash) VALUES (?,?,2,?,?)',
            [nombre, apellido, username, md5(password)]
        );
        await db.query(
            'INSERT INTO balances (id_usuario, total_ingresos, total_gastos, balance_actual) VALUES (?,0,0,0)',
            [result.insertId]
        );
        res.json({ ok: true });
    } catch (e) {
        res.status(500).json({ ok: false, mensaje: e.message });
    }
});

// Logout
router.get('/logout', (req, res) => {
    req.session.destroy();
    res.json({ ok: true });
});

// Verificar sesión
router.get('/sesion', (req, res) => {
    if (req.session.usuario) {
        res.json({ ok: true, usuario: req.session.usuario });
    } else {
        res.json({ ok: false });
    }
});

module.exports = router;