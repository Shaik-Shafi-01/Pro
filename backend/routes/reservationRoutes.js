const express = require('express');
const pool = require('../config/db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.post('/', requireAuth, async (req, res, next) => {
  try {
    const { reservationDate, reservationTime, guests, specialRequest } = req.body;

    if (!reservationDate || !reservationTime) {
      return res.status(400).json({ message: 'Reservation date and time are required.' });
    }

    const guestCount = Number(guests);
    if (Number.isNaN(guestCount) || guestCount < 1 || guestCount > 20) {
      return res.status(400).json({ message: 'Guests must be between 1 and 20.' });
    }

    const dateTime = new Date(`${reservationDate}T${reservationTime}`);
    if (Number.isNaN(dateTime.getTime())) {
      return res.status(400).json({ message: 'Invalid reservation date or time.' });
    }

    if (dateTime.getTime() <= Date.now()) {
      return res.status(400).json({ message: 'Reservation must be in the future.' });
    }

    const mysqlDateTime = `${reservationDate} ${reservationTime}:00`;

    const [result] = await pool.query(
      `INSERT INTO reservations (user_id, reservation_datetime, guests, status, special_request)
       VALUES (?, ?, ?, ?, ?)`,
      [req.user.id, mysqlDateTime, guestCount, 'PENDING', specialRequest || null]
    );

    return res.status(201).json({
      message: 'Reservation submitted.',
      reservationId: result.insertId
    });
  } catch (error) {
    return next(error);
  }
});

router.get('/my', requireAuth, async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, reservation_datetime, guests, status, special_request, created_at
       FROM reservations
       WHERE user_id = ?
       ORDER BY reservation_datetime ASC`,
      [req.user.id]
    );

    return res.json(rows);
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
