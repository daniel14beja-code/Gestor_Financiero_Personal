const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT u.*, p.perfil FROM usuarios u JOIN perfiles p ON u.id_perfil = p.id_perfil ORDER BY u.id_usuario'
        );
        res.json({ ok: true, data: rows });
    } catch (e) {
        res.status(500).json({ ok: false, mensaje: e.message });
    }
});

module.exports = router;