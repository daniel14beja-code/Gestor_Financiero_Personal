const express = require('express');
const router = express.Router();
const db = require('../db');

// Listar transacciones del usuario en sesión
router.get('/', async (req, res) => {
    try {
        if (!req.session.usuario) return res.status(401).json({ ok: false });
        const [rows] = await db.query(
            'SELECT t.*, c.nombre AS nom_cat, c.tipo AS tipo_cat FROM transacciones t JOIN categorias c ON t.id_categoria = c.id_categoria WHERE t.id_usuario=? ORDER BY t.fecha DESC',
            [req.session.usuario.id]
        );
        res.json({ ok: true, data: rows });
    } catch (e) {
        res.status(500).json({ ok: false, mensaje: e.message });
    }
});

// Registrar transacción
router.post('/', async (req, res) => {
    try {
        if (!req.session.usuario) return res.status(401).json({ ok: false });
        const { id_categoria, fecha, descripcion, monto } = req.body;
        if (monto <= 0) return res.json({ ok: false, mensaje: 'El monto debe ser mayor a 0' });
        await db.query(
            'INSERT INTO transacciones (id_usuario, id_categoria, fecha, descripcion, monto) VALUES (?,?,?,?,?)',
            [req.session.usuario.id, id_categoria, fecha, descripcion, monto]
        );
        res.json({ ok: true });
    } catch (e) {
        res.status(500).json({ ok: false, mensaje: e.message });
    }
});

// Obtener una transacción por id
router.get('/:id', async (req, res) => {
    try {
        if (!req.session.usuario) return res.status(401).json({ ok: false });
        const [rows] = await db.query(
            'SELECT t.*, c.nombre AS nom_cat, c.tipo AS tipo_cat FROM transacciones t JOIN categorias c ON t.id_categoria = c.id_categoria WHERE t.id_transaccion=? AND t.id_usuario=?',
            [req.params.id, req.session.usuario.id]
        );
        if (rows.length === 0) return res.json({ ok: false, mensaje: 'No encontrado' });
        res.json({ ok: true, data: rows[0] });
    } catch (e) {
        res.status(500).json({ ok: false, mensaje: e.message });
    }
});

// Actualizar transacción
router.put('/:id', async (req, res) => {
    try {
        if (!req.session.usuario) return res.status(401).json({ ok: false });
        const { id_categoria, fecha, descripcion, monto } = req.body;
        if (monto <= 0) return res.json({ ok: false, mensaje: 'El monto debe ser mayor a 0' });
        await db.query(
            'UPDATE transacciones SET id_categoria=?, fecha=?, descripcion=?, monto=? WHERE id_transaccion=? AND id_usuario=?',
            [id_categoria, fecha, descripcion, monto, req.params.id, req.session.usuario.id]
        );
        res.json({ ok: true });
    } catch (e) {
        res.status(500).json({ ok: false, mensaje: e.message });
    }
});

// Eliminar transacción
router.delete('/:id', async (req, res) => {
    try {
        if (!req.session.usuario) return res.status(401).json({ ok: false });
        await db.query(
            'DELETE FROM transacciones WHERE id_transaccion=? AND id_usuario=?',
            [req.params.id, req.session.usuario.id]
        );
        res.json({ ok: true });
    } catch (e) {
        res.status(500).json({ ok: false, mensaje: e.message });
    }
});

module.exports = router;