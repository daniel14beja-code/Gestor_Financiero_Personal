const express = require('express');
const router = express.Router();
const db = require('../db');

// Listar alcancías del usuario
router.get('/', async (req, res) => {
    try {
        if (!req.session.usuario) return res.status(401).json({ ok: false });
        const [rows] = await db.query(
            'SELECT * FROM alcancias WHERE id_usuario=? ORDER BY fecha_creacion DESC',
            [req.session.usuario.id]
        );
        res.json({ ok: true, data: rows });
    } catch (e) {
        res.status(500).json({ ok: false, mensaje: e.message });
    }
});

// Crear alcancía
router.post('/', async (req, res) => {
    try {
        if (!req.session.usuario) return res.status(401).json({ ok: false });
        const { nombre, descripcion, meta, fecha_retiro } = req.body;
        await db.query(
            'INSERT INTO alcancias (id_usuario, nombre, descripcion, meta, fecha_retiro) VALUES (?,?,?,?,?)',
            [req.session.usuario.id, nombre, descripcion || null,
             meta || null, fecha_retiro || null]
        );
        res.json({ ok: true });
    } catch (e) {
        res.status(500).json({ ok: false, mensaje: e.message });
    }
});

// Depositar
router.post('/:id/depositar', async (req, res) => {
    const conn = await db.getConnection();
    try {
        if (!req.session.usuario) return res.status(401).json({ ok: false });
        const { monto, descripcion } = req.body;
        const idUsuario = req.session.usuario.id;
        const idAlcancia = req.params.id;

        if (monto <= 0) return res.json({ ok: false, mensaje: 'El monto debe ser mayor a 0' });

        await conn.beginTransaction();

        // Verificar balance disponible
        const [[balance]] = await conn.query(
            'SELECT balance_actual FROM balances WHERE id_usuario=?', [idUsuario]
        );
        if (!balance || parseFloat(balance.balance_actual) < parseFloat(monto)) {
            await conn.rollback();
            return res.json({ ok: false, mensaje: 'Balance insuficiente' });
        }

        // Verificar que la alcancía pertenece al usuario
        const [[alcancia]] = await conn.query(
            'SELECT * FROM alcancias WHERE id_alcancia=? AND id_usuario=?',
            [idAlcancia, idUsuario]
        );
        if (!alcancia) {
            await conn.rollback();
            return res.json({ ok: false, mensaje: 'Alcancía no encontrada' });
        }

        // Restar del balance
        await conn.query(
            'UPDATE balances SET total_gastos = total_gastos + ?, balance_actual = balance_actual - ? WHERE id_usuario=?',
            [monto, monto, idUsuario]
        );

        // Sumar a la alcancía
        await conn.query(
            'UPDATE alcancias SET saldo = saldo + ? WHERE id_alcancia=?',
            [monto, idAlcancia]
        );

        // Registrar movimiento
        await conn.query(
            'INSERT INTO movimientos_alcancia (id_alcancia, tipo, monto, descripcion) VALUES (?,?,?,?)',
            [idAlcancia, 'deposito', monto, descripcion || 'Depósito a alcancía']
        );

        await conn.commit();
        res.json({ ok: true });
    } catch (e) {
        await conn.rollback();
        res.status(500).json({ ok: false, mensaje: e.message });
    } finally {
        conn.release();
    }
});

// Retirar
router.post('/:id/retirar', async (req, res) => {
    const conn = await db.getConnection();
    try {
        if (!req.session.usuario) return res.status(401).json({ ok: false });
        const { monto, descripcion } = req.body;
        const idUsuario = req.session.usuario.id;
        const idAlcancia = req.params.id;

        await conn.beginTransaction();

        // Verificar alcancía
        const [[alcancia]] = await conn.query(
            'SELECT * FROM alcancias WHERE id_alcancia=? AND id_usuario=?',
            [idAlcancia, idUsuario]
        );
        if (!alcancia) {
            await conn.rollback();
            return res.json({ ok: false, mensaje: 'Alcancía no encontrada' });
        }

        // Verificar fecha de retiro
        if (alcancia.fecha_retiro) {
            const hoy = new Date();
            const fechaRetiro = new Date(alcancia.fecha_retiro);
            if (hoy < fechaRetiro) {
                await conn.rollback();
                const dias = Math.ceil((fechaRetiro - hoy) / (1000 * 60 * 60 * 24));
                return res.json({ ok: false, mensaje: `No puedes retirar todavía. Faltan ${dias} días.` });
            }
        }

        // Verificar saldo en alcancía
        if (parseFloat(alcancia.saldo) < parseFloat(monto)) {
            await conn.rollback();
            return res.json({ ok: false, mensaje: 'Saldo insuficiente en la alcancía' });
        }

        // Restar de la alcancía
        await conn.query(
            'UPDATE alcancias SET saldo = saldo - ? WHERE id_alcancia=?',
            [monto, idAlcancia]
        );

        // Sumar al balance del usuario
        await conn.query(
            'UPDATE balances SET total_ingresos = total_ingresos + ?, balance_actual = balance_actual + ? WHERE id_usuario=?',
            [monto, monto, idUsuario]
        );

        // Registrar movimiento
        await conn.query(
            'INSERT INTO movimientos_alcancia (id_alcancia, tipo, monto, descripcion) VALUES (?,?,?,?)',
            [idAlcancia, 'retiro', monto, descripcion || 'Retiro de alcancía']
        );

        await conn.commit();
        res.json({ ok: true });
    } catch (e) {
        await conn.rollback();
        res.status(500).json({ ok: false, mensaje: e.message });
    } finally {
        conn.release();
    }
});

// Historial de movimientos
router.get('/:id/movimientos', async (req, res) => {
    try {
        if (!req.session.usuario) return res.status(401).json({ ok: false });
        const [rows] = await db.query(
            'SELECT * FROM movimientos_alcancia WHERE id_alcancia=? ORDER BY fecha DESC',
            [req.params.id]
        );
        res.json({ ok: true, data: rows });
    } catch (e) {
        res.status(500).json({ ok: false, mensaje: e.message });
    }
});

// Eliminar alcancía (solo si saldo es 0)
router.delete('/:id', async (req, res) => {
    const conn = await db.getConnection();
    try {
        if (!req.session.usuario) return res.status(401).json({ ok: false });
        const idUsuario = req.session.usuario.id;
        const idAlcancia = req.params.id;

        await conn.beginTransaction();

        const [[alcancia]] = await conn.query(
            'SELECT * FROM alcancias WHERE id_alcancia=? AND id_usuario=?',
            [idAlcancia, idUsuario]
        );

        if (!alcancia) {
            await conn.rollback();
            return res.json({ ok: false, mensaje: 'Alcancía no encontrada' });
        }

        // Si tiene saldo, devolverlo al balance antes de eliminar
        if (parseFloat(alcancia.saldo) > 0) {
            await conn.query(
                'UPDATE balances SET total_ingresos = total_ingresos + ?, balance_actual = balance_actual + ? WHERE id_usuario=?',
                [alcancia.saldo, alcancia.saldo, idUsuario]
            );
        }

        await conn.query('DELETE FROM alcancias WHERE id_alcancia=?', [idAlcancia]);
        await conn.commit();
        res.json({ ok: true });
    } catch (e) {
        await conn.rollback();
        res.status(500).json({ ok: false, mensaje: e.message });
    } finally {
        conn.release();
    }
});

module.exports = router;