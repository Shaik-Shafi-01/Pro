import { useEffect, useState } from 'react';
import { apiRequest } from '../api';

function Reservations() {
  const [reservationDate, setReservationDate] = useState('');
  const [reservationTime, setReservationTime] = useState('');
  const [guests, setGuests] = useState(2);
  const [specialRequest, setSpecialRequest] = useState('');
  const [reservations, setReservations] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const minDate = new Date().toISOString().slice(0, 10);

  const loadReservations = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await apiRequest('/reservations/my');
      setReservations(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReservations();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await apiRequest('/reservations', {
        method: 'POST',
        body: {
          reservationDate,
          reservationTime,
          guests: Number(guests),
          specialRequest
        }
      });

      setReservationDate('');
      setReservationTime('');
      setGuests(2);
      setSpecialRequest('');
      await loadReservations();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container section">
      <div className="section-head">
        <h2>Table Reservations</h2>
        <p>Reserve a table instantly and track confirmation status.</p>
      </div>

      {error && <p className="alert error">{error}</p>}

      <div className="two-col">
        <form className="panel" onSubmit={handleSubmit}>
          <h3>Book a Table</h3>
          <label htmlFor="reservationDate">Date</label>
          <input
            id="reservationDate"
            type="date"
            min={minDate}
            value={reservationDate}
            onChange={(event) => setReservationDate(event.target.value)}
            required
          />

          <label htmlFor="reservationTime">Time</label>
          <input
            id="reservationTime"
            type="time"
            value={reservationTime}
            onChange={(event) => setReservationTime(event.target.value)}
            required
          />

          <label htmlFor="guests">Guests</label>
          <input
            id="guests"
            type="number"
            min={1}
            max={20}
            value={guests}
            onChange={(event) => setGuests(event.target.value)}
            required
          />

          <label htmlFor="specialRequest">Special Request</label>
          <textarea
            id="specialRequest"
            rows={3}
            value={specialRequest}
            onChange={(event) => setSpecialRequest(event.target.value)}
            placeholder="Occasion, seating preference, dietary notes"
          />

          <button type="submit" className="btn btn-solid full-width" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Reserve Now'}
          </button>
        </form>

        <div className="panel">
          <h3>Your Reservations</h3>
          {loading && <p>Loading reservations...</p>}
          {!loading && reservations.length === 0 && <p>No reservations found.</p>}

          <div className="stack-list">
            {reservations.map((reservation) => (
              <article key={reservation.id} className="list-card">
                <div className="list-head">
                  <strong>{new Date(reservation.reservation_datetime).toLocaleString()}</strong>
                  <span className={`status ${reservation.status.toLowerCase()}`}>{reservation.status}</span>
                </div>
                <p>Guests: {reservation.guests}</p>
                {reservation.special_request && <p>Request: {reservation.special_request}</p>}
              </article>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Reservations;
