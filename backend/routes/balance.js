const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res) => {
    try {
        if (!req.session.usuario) return res.status(401).json({ ok: false });
        const [rows] = await db.query(
            'SELECT * FROM balances WHERE id_usuario=?',
            [req.session.usuario.id]
        );
        res.json({ ok: true, data: rows[0] });
    } catch (e) {
        res.status(500).json({ ok: false, mensaje: e.message });
    }
});

module.exports = router;