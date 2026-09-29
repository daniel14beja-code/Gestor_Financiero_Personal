const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res) => {
    try {
        if (!req.session.usuario) return res.status(401).json({ ok: false });
        const { desde, hasta } = req.query;
        let q = 'SELECT * FROM auditoria_transacciones';
        let params = [];
        if (desde && hasta) {
            q += ' WHERE DATE(fecha) BETWEEN ? AND ?';
            params = [desde, hasta];
        }
        q += ' ORDER BY fecha DESC';
        const [rows] = await db.query(q, params);
        res.json({ ok: true, data: rows });
    } catch (e) {
        res.status(500).json({ ok: false, mensaje: e.message });
    }
});

module.exports = router;