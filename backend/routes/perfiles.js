const express = require('express');
const router = express.Router();
const db = require('../db');

// ← PRIMERO: rutas específicas
router.get('/usuarios', async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT u.*, p.perfil FROM usuarios u JOIN perfiles p ON u.id_perfil = p.id_perfil ORDER BY u.id_usuario'
        );
        res.json({ ok: true, data: rows });
    } catch (e) {
        res.status(500).json({ ok: false, mensaje: e.message });
    }
});

router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM perfiles ORDER BY id_perfil');
        res.json({ ok: true, data: rows });
    } catch (e) {
        res.status(500).json({ ok: false, mensaje: e.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const { perfil } = req.body;
        const [existe] = await db.query('SELECT id_perfil FROM perfiles WHERE perfil=?', [perfil]);
        if (existe.length > 0) return res.json({ ok: false, mensaje: 'Ese perfil ya existe' });
        await db.query('INSERT INTO perfiles (perfil) VALUES (?)', [perfil.toLowerCase().trim()]);
        res.json({ ok: true });
    } catch (e) {
        res.status(500).json({ ok: false, mensaje: e.message });
    }
});

router.put('/asignar', async (req, res) => {
    try {
        const { id_usuario, id_perfil } = req.body;
        await db.query('UPDATE usuarios SET id_perfil=? WHERE id_usuario=?', [id_perfil, id_usuario]);
        res.json({ ok: true });
    } catch (e) {
        res.status(500).json({ ok: false, mensaje: e.message });
    }
});

// ← ÚLTIMO: rutas con parámetro dinámico
router.delete('/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM perfiles WHERE id_perfil=?', [req.params.id]);
        res.json({ ok: true });
    } catch (e) {
        res.status(500).json({ ok: false, mensaje: e.message });
    }
});

module.exports = router;