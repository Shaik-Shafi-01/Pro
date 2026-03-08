import { useEffect, useState } from 'react';
import { apiRequest } from '../api';

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadOrders = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await apiRequest('/orders/my');
        setOrders(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  return (
    <div className="container section">
      <div className="section-head">
        <h2>My Orders</h2>
        <p>Track order progress and payment verification.</p>
      </div>

      {error && <p className="alert error">{error}</p>}
      {loading && <p className="panel">Loading orders...</p>}

      {!loading && orders.length === 0 && <div className="panel">No orders yet.</div>}

      <div className="stack-list">
        {orders.map((order) => (
          <article key={order.id} className="panel">
            <div className="list-head">
              <h3>Order #{order.id}</h3>
              <span className={`status ${order.status.toLowerCase()}`}>{order.status}</span>
            </div>
            <p>
              Payment: {order.payment_method} | Payment Status:{' '}
              <span className={`status ${order.payment_status.toLowerCase()}`}>{order.payment_status}</span>
            </p>
            <p>Total: Rs. {Number(order.total_amount).toFixed(2)}</p>
            <p>Placed: {new Date(order.created_at).toLocaleString()}</p>
            <p>Delivery Address: {order.delivery_address}</p>
            <div className="order-items">
              {order.items.map((item) => (
                <div key={`${order.id}-${item.menu_item_id}`} className="order-item-row">
                  <span>{item.name}</span>
                  <span>
                    {item.quantity} x Rs. {Number(item.price_each).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

export default Orders;
