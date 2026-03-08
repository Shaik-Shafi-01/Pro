const express = require('express');
const pool = require('../config/db');
const { requireAuth } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/admin');

const router = express.Router();

router.use(requireAuth, requireAdmin);

router.get('/stats', async (_req, res, next) => {
  try {
    const [[usersCount]] = await pool.query('SELECT COUNT(*) AS count FROM users');
    const [[ordersCount]] = await pool.query('SELECT COUNT(*) AS count FROM orders');
    const [[reservationsCount]] = await pool.query('SELECT COUNT(*) AS count FROM reservations');
    const [[revenue]] = await pool.query(
      `SELECT COALESCE(SUM(total_amount), 0) AS total
       FROM orders
       WHERE payment_status = 'PAID'`
    );

    return res.json({
      users: usersCount.count,
      orders: ordersCount.count,
      reservations: reservationsCount.count,
      revenue: Number(revenue.total)
    });
  } catch (error) {
    return next(error);
  }
});

router.get('/menu', async (_req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM menu_items ORDER BY id DESC');
    return res.json(rows);
  } catch (error) {
    return next(error);
  }
});

router.post('/menu', async (req, res, next) => {
  try {
    const { name, description, category, imageUrl, price, isAvailable } = req.body;

    if (!name || !category || !price) {
      return res.status(400).json({ message: 'Name, category and price are required.' });
    }

    const [result] = await pool.query(
      `INSERT INTO menu_items
        (name, description, category, image_url, price, is_available)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        name.trim(),
        description || null,
        category.trim(),
        imageUrl || null,
        Number(price),
        isAvailable === false ? 0 : 1
      ]
    );

    return res.status(201).json({ id: result.insertId, message: 'Menu item created.' });
  } catch (error) {
    return next(error);
  }
});

router.put('/menu/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, category, imageUrl, price, isAvailable } = req.body;

    if (!name || !category || !price) {
      return res.status(400).json({ message: 'Name, category and price are required.' });
    }

    const [result] = await pool.query(
      `UPDATE menu_items
       SET name = ?, description = ?, category = ?, image_url = ?, price = ?, is_available = ?
       WHERE id = ?`,
      [
        name.trim(),
        description || null,
        category.trim(),
        imageUrl || null,
        Number(price),
        isAvailable === false ? 0 : 1,
        Number(id)
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Menu item not found.' });
    }

    return res.json({ message: 'Menu item updated.' });
  } catch (error) {
    return next(error);
  }
});

router.delete('/menu/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query(
      'UPDATE menu_items SET is_available = 0 WHERE id = ?',
      [Number(id)]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Menu item not found.' });
    }

    return res.json({ message: 'Menu item disabled.' });
  } catch (error) {
    return next(error);
  }
});

router.get('/orders', async (_req, res, next) => {
  try {
    const [orders] = await pool.query(
      `SELECT o.id, o.total_amount, o.status, o.payment_method, o.payment_status,
              o.payment_reference, o.delivery_address, o.created_at,
              u.name AS customer_name, u.email AS customer_email
       FROM orders o
       JOIN users u ON u.id = o.user_id
       ORDER BY o.created_at DESC`
    );

    const data = [];

    for (const order of orders) {
      const [items] = await pool.query(
        `SELECT oi.menu_item_id, oi.quantity, oi.price_each, m.name
         FROM order_items oi
         JOIN menu_items m ON m.id = oi.menu_item_id
         WHERE oi.order_id = ?`,
        [order.id]
      );

      data.push({ ...order, items });
    }

    return res.json(data);
  } catch (error) {
    return next(error);
  }
});

router.put('/orders/:id/status', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, paymentStatus } = req.body;

    const allowedOrderStatus = ['PENDING', 'CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'];
    const allowedPaymentStatus = ['PENDING', 'PAID', 'FAILED'];

    if (!allowedOrderStatus.includes(status)) {
      return res.status(400).json({ message: 'Invalid order status.' });
    }

    if (!allowedPaymentStatus.includes(paymentStatus)) {
      return res.status(400).json({ message: 'Invalid payment status.' });
    }

    const [result] = await pool.query(
      'UPDATE orders SET status = ?, payment_status = ? WHERE id = ?',
      [status, paymentStatus, Number(id)]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    return res.json({ message: 'Order updated.' });
  } catch (error) {
    return next(error);
  }
});

router.get('/reservations', async (_req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT r.id, r.reservation_datetime, r.guests, r.status, r.special_request, r.created_at,
              u.name AS customer_name, u.email AS customer_email
       FROM reservations r
       JOIN users u ON u.id = r.user_id
       ORDER BY r.reservation_datetime ASC`
    );

    return res.json(rows);
  } catch (error) {
    return next(error);
  }
});

router.put('/reservations/:id/status', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const allowedStatus = ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'];

    if (!allowedStatus.includes(status)) {
      return res.status(400).json({ message: 'Invalid reservation status.' });
    }

    const [result] = await pool.query(
      'UPDATE reservations SET status = ? WHERE id = ?',
      [status, Number(id)]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Reservation not found.' });
    }

    return res.json({ message: 'Reservation updated.' });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;