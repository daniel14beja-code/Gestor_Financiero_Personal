const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM categorias ORDER BY tipo, nombre');
        res.json({ ok: true, data: rows });
    } catch (e) {
        res.status(500).json({ ok: false, mensaje: e.message });
    }
});

router.get('/:tipo', async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT * FROM categorias WHERE tipo=? ORDER BY nombre',
            [req.params.tipo]
        );
        res.json({ ok: true, data: rows });
    } catch (e) {
        res.status(500).json({ ok: false, mensaje: e.message });
    }
});

module.exports = router;