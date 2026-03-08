import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

function Cart() {
  const { items, total, removeFromCart, updateQuantity, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [upiId, setUpiId] = useState('');
  const [paymentTxnRef, setPaymentTxnRef] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const restaurantUpiId = import.meta.env.VITE_RESTAURANT_UPI_ID || '6302367989@fam';
  const upiPayLink = `upi://pay?pa=${encodeURIComponent(restaurantUpiId)}&pn=${encodeURIComponent('Urban Bites')}&am=${total.toFixed(2)}&cu=INR&tn=${encodeURIComponent('Food Order')}`;

  const handleCheckout = async (event) => {
    event.preventDefault();

    if (!user) {
      navigate('/login', { state: { from: '/cart' } });
      return;
    }

    if (!deliveryAddress.trim()) {
      setError('Delivery address is required.');
      return;
    }

    if (paymentMethod === 'UPI' && !paymentTxnRef.trim()) {
      setError('Enter UPI transaction reference after payment.');
      return;
    }

    if (items.length === 0) {
      setError('Your cart is empty.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await apiRequest('/orders', {
        method: 'POST',
        body: {
          items: items.map((item) => ({ menuItemId: item.id, quantity: item.quantity })),
          deliveryAddress,
          paymentMethod,
          upiId: paymentMethod === 'UPI' ? upiId : null,
          paymentTxnRef: paymentMethod === 'UPI' ? paymentTxnRef : null
        }
      });

      clearCart();
      navigate('/orders');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container section">
      <div className="section-head">
        <h2>Your Cart</h2>
        <p>Review items and place your order.</p>
      </div>

      {error && <p className="alert error">{error}</p>}

      {items.length === 0 ? (
        <div className="panel">Your cart is currently empty.</div>
      ) : (
        <div className="cart-layout">
          <div className="panel">
            <div className="cart-items">
              {items.map((item) => (
                <div key={item.id} className="cart-item">
                  <img
                    src={item.image_url || 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=800&q=80'}
                    alt={item.name}
                  />
                  <div>
                    <h4>{item.name}</h4>
                    <p>Rs. {Number(item.price).toFixed(2)}</p>
                    <div className="qty-row">
                      <button type="button" className="btn btn-outline" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                        -
                      </button>
                      <span>{item.quantity}</span>
                      <button type="button" className="btn btn-outline" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                        +
                      </button>
                      <button type="button" className="btn btn-outline" onClick={() => removeFromCart(item.id)}>
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <form className="panel" onSubmit={handleCheckout}>
            <h3>Checkout</h3>
            <label htmlFor="deliveryAddress">Delivery Address</label>
            <textarea
              id="deliveryAddress"
              value={deliveryAddress}
              onChange={(event) => setDeliveryAddress(event.target.value)}
              placeholder="Enter full delivery address"
              rows={4}
              required
            />

            <label htmlFor="paymentMethod">Payment Method</label>
            <select
              id="paymentMethod"
              value={paymentMethod}
              onChange={(event) => setPaymentMethod(event.target.value)}
            >
              <option value="UPI">UPI</option>
              <option value="CASH">Cash on Delivery</option>
            </select>

            {paymentMethod === 'UPI' && (
              <div className="upi-box">
                <p>Pay to UPI ID: <strong>{restaurantUpiId}</strong></p>
                <a className="btn btn-outline" href={upiPayLink}>
                  Pay via UPI App
                </a>
                <label htmlFor="upiId">Your UPI ID</label>
                <input
                  id="upiId"
                  type="text"
                  value={upiId}
                  onChange={(event) => setUpiId(event.target.value)}
                  placeholder="example@upi"
                />
                <label htmlFor="paymentTxnRef">UPI Transaction Reference</label>
                <input
                  id="paymentTxnRef"
                  type="text"
                  value={paymentTxnRef}
                  onChange={(event) => setPaymentTxnRef(event.target.value)}
                  placeholder="Enter UTR / reference number"
                />
              </div>
            )}

            <div className="total-row">
              <span>Total Amount</span>
              <strong>Rs. {total.toFixed(2)}</strong>
            </div>

            <button type="submit" className="btn btn-solid full-width" disabled={submitting}>
              {submitting ? 'Placing Order...' : 'Place Order'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default Cart;
