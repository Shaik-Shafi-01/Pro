const express = require('express');
const pool = require('../config/db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.post('/', requireAuth, async (req, res, next) => {
  const connection = await pool.getConnection();

  try {
    const { items, deliveryAddress, paymentMethod, upiId, paymentTxnRef } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'At least one item is required.' });
    }

    if (!deliveryAddress || typeof deliveryAddress !== 'string') {
      return res.status(400).json({ message: 'Delivery address is required.' });
    }

    const method = (paymentMethod || '').toUpperCase();
    if (!['UPI', 'CASH'].includes(method)) {
      return res.status(400).json({ message: 'Payment method must be UPI or CASH.' });
    }

    const normalizedItems = items
      .map((item) => ({
        menuItemId: Number(item.menuItemId),
        quantity: Number(item.quantity)
      }))
      .filter((item) => item.menuItemId > 0 && item.quantity > 0);

    if (normalizedItems.length === 0) {
      return res.status(400).json({ message: 'Invalid cart items.' });
    }

    const uniqueIds = [...new Set(normalizedItems.map((item) => item.menuItemId))];
    const placeholders = uniqueIds.map(() => '?').join(',');

    const [menuRows] = await connection.query(
      `SELECT id, name, price, is_available FROM menu_items WHERE id IN (${placeholders})`,
      uniqueIds
    );

    if (menuRows.length !== uniqueIds.length) {
      return res.status(400).json({ message: 'Some menu items are unavailable.' });
    }

    const priceMap = new Map(menuRows.map((row) => [row.id, row]));

    let totalAmount = 0;
    for (const item of normalizedItems) {
      const menuItem = priceMap.get(item.menuItemId);
      if (!menuItem || menuItem.is_available !== 1) {
        return res.status(400).json({ message: 'Some menu items are unavailable.' });
      }
      totalAmount += Number(menuItem.price) * item.quantity;
    }

    await connection.beginTransaction();

    const [orderResult] = await connection.query(
      `INSERT INTO orders
        (user_id, total_amount, status, payment_method, payment_status, payment_reference, upi_id, delivery_address)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.id,
        totalAmount,
        'PENDING',
        method,
        'PENDING',
        paymentTxnRef || null,
        upiId || null,
        deliveryAddress.trim()
      ]
    );

    for (const item of normalizedItems) {
      const menuItem = priceMap.get(item.menuItemId);
      await connection.query(
        'INSERT INTO order_items (order_id, menu_item_id, quantity, price_each) VALUES (?, ?, ?, ?)',
        [orderResult.insertId, item.menuItemId, item.quantity, menuItem.price]
      );
    }

    await connection.commit();

    return res.status(201).json({
      message: 'Order placed successfully.',
      orderId: orderResult.insertId,
      totalAmount
    });
  } catch (error) {
    try {
      await connection.rollback();
    } catch (_rollbackError) {
      // Ignore rollback failures when transaction was not started.
    }
    return next(error);
  } finally {
    connection.release();
  }
});

router.get('/my', requireAuth, async (req, res, next) => {
  try {
    const [orders] = await pool.query(
      `SELECT id, total_amount, status, payment_method, payment_status, payment_reference,
              upi_id, delivery_address, created_at
       FROM orders
       WHERE user_id = ?
       ORDER BY created_at DESC`,
      [req.user.id]
    );

    const enriched = [];

    for (const order of orders) {
      const [items] = await pool.query(
        `SELECT oi.menu_item_id, oi.quantity, oi.price_each, m.name, m.image_url
         FROM order_items oi
         JOIN menu_items m ON m.id = oi.menu_item_id
         WHERE oi.order_id = ?`,
        [order.id]
      );

      enriched.push({ ...order, items });
    }

    return res.json(enriched);
  } catch (error) {
    return next(error);
  }
});

module.exports = router;

