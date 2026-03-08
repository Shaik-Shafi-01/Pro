import { useEffect, useState } from 'react';
import { apiRequest } from '../api';

const ORDER_STATUS_OPTIONS = ['PENDING', 'CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'];
const PAYMENT_STATUS_OPTIONS = ['PENDING', 'PAID', 'FAILED'];
const RESERVATION_STATUS_OPTIONS = ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'];

const defaultMenuForm = {
  name: '',
  description: '',
  category: '',
  imageUrl: '',
  price: '',
  isAvailable: true
};

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({ users: 0, orders: 0, reservations: 0, revenue: 0 });
  const [menuItems, setMenuItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [orderDrafts, setOrderDrafts] = useState({});

  const [menuForm, setMenuForm] = useState(defaultMenuForm);
  const [editingMenuId, setEditingMenuId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadDashboard = async () => {
    setLoading(true);
    setError('');

    try {
      const [statsData, menuData, ordersData, reservationsData] = await Promise.all([
        apiRequest('/admin/stats'),
        apiRequest('/admin/menu'),
        apiRequest('/admin/orders'),
        apiRequest('/admin/reservations')
      ]);

      setStats(statsData);
      setMenuItems(menuData);
      setOrders(ordersData);
      setReservations(reservationsData);

      const drafts = {};
      for (const order of ordersData) {
        drafts[order.id] = {
          status: order.status,
          paymentStatus: order.payment_status
        };
      }
      setOrderDrafts(drafts);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const resetMenuForm = () => {
    setMenuForm(defaultMenuForm);
    setEditingMenuId(null);
  };

  const handleMenuSubmit = async (event) => {
    event.preventDefault();

    try {
      if (editingMenuId) {
        await apiRequest(`/admin/menu/${editingMenuId}`, {
          method: 'PUT',
          body: {
            ...menuForm,
            price: Number(menuForm.price),
            isAvailable: Boolean(menuForm.isAvailable)
          }
        });
      } else {
        await apiRequest('/admin/menu', {
          method: 'POST',
          body: {
            ...menuForm,
            price: Number(menuForm.price),
            isAvailable: Boolean(menuForm.isAvailable)
          }
        });
      }

      resetMenuForm();
      await loadDashboard();
    } catch (err) {
      setError(err.message);
    }
  };

  const editMenuItem = (item) => {
    setEditingMenuId(item.id);
    setMenuForm({
      name: item.name || '',
      description: item.description || '',
      category: item.category || '',
      imageUrl: item.image_url || '',
      price: item.price || '',
      isAvailable: item.is_available === 1
    });
    setActiveTab('menu');
  };

  const disableMenuItem = async (id) => {
    try {
      await apiRequest(`/admin/menu/${id}`, { method: 'DELETE' });
      await loadDashboard();
    } catch (err) {
      setError(err.message);
    }
  };

  const updateOrderDraft = (orderId, key, value) => {
    setOrderDrafts((prev) => ({
      ...prev,
      [orderId]: {
        ...prev[orderId],
        [key]: value
      }
    }));
  };

  const saveOrderStatus = async (orderId) => {
    const draft = orderDrafts[orderId];
    if (!draft) {
      return;
    }

    try {
      await apiRequest(`/admin/orders/${orderId}/status`, {
        method: 'PUT',
        body: {
          status: draft.status,
          paymentStatus: draft.paymentStatus
        }
      });

      await loadDashboard();
    } catch (err) {
      setError(err.message);
    }
  };

  const saveReservationStatus = async (reservationId, status) => {
    try {
      await apiRequest(`/admin/reservations/${reservationId}/status`, {
        method: 'PUT',
        body: { status }
      });
      await loadDashboard();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="container section">
      <div className="section-head">
        <h2>Admin Dashboard</h2>
        <p>Manage menu inventory, live orders, reservations, and key metrics.</p>
      </div>

      {error && <p className="alert error">{error}</p>}

      <div className="tab-row">
        <button type="button" className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
          Overview
        </button>
        <button type="button" className={`tab-btn ${activeTab === 'menu' ? 'active' : ''}`} onClick={() => setActiveTab('menu')}>
          Menu
        </button>
        <button type="button" className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>
          Orders
        </button>
        <button type="button" className={`tab-btn ${activeTab === 'reservations' ? 'active' : ''}`} onClick={() => setActiveTab('reservations')}>
          Reservations
        </button>
      </div>

      {loading && <p className="panel">Loading dashboard...</p>}

      {!loading && activeTab === 'overview' && (
        <div className="stats-grid">
          <article className="stat-card">
            <h4>Total Users</h4>
            <strong>{stats.users}</strong>
          </article>
          <article className="stat-card">
            <h4>Total Orders</h4>
            <strong>{stats.orders}</strong>
          </article>
          <article className="stat-card">
            <h4>Reservations</h4>
            <strong>{stats.reservations}</strong>
          </article>
          <article className="stat-card">
            <h4>Revenue</h4>
            <strong>Rs. {Number(stats.revenue).toFixed(2)}</strong>
          </article>
        </div>
      )}

      {!loading && activeTab === 'menu' && (
        <div className="two-col admin-grid">
          <form className="panel" onSubmit={handleMenuSubmit}>
            <h3>{editingMenuId ? 'Edit Menu Item' : 'Add Menu Item'}</h3>

            <label htmlFor="menuName">Name</label>
            <input
              id="menuName"
              type="text"
              value={menuForm.name}
              onChange={(event) => setMenuForm((prev) => ({ ...prev, name: event.target.value }))}
              required
            />

            <label htmlFor="menuCategory">Category</label>
            <input
              id="menuCategory"
              type="text"
              value={menuForm.category}
              onChange={(event) => setMenuForm((prev) => ({ ...prev, category: event.target.value }))}
              required
            />

            <label htmlFor="menuPrice">Price</label>
            <input
              id="menuPrice"
              type="number"
              min="1"
              step="0.01"
              value={menuForm.price}
              onChange={(event) => setMenuForm((prev) => ({ ...prev, price: event.target.value }))}
              required
            />

            <label htmlFor="menuImage">Image URL</label>
            <input
              id="menuImage"
              type="text"
              value={menuForm.imageUrl}
              onChange={(event) => setMenuForm((prev) => ({ ...prev, imageUrl: event.target.value }))}
            />

            <label htmlFor="menuDescription">Description</label>
            <textarea
              id="menuDescription"
              rows={3}
              value={menuForm.description}
              onChange={(event) => setMenuForm((prev) => ({ ...prev, description: event.target.value }))}
            />

            <label className="checkbox-row" htmlFor="menuAvailability">
              <input
                id="menuAvailability"
                type="checkbox"
                checked={menuForm.isAvailable}
                onChange={(event) => setMenuForm((prev) => ({ ...prev, isAvailable: event.target.checked }))}
              />
              Available
            </label>

            <div className="inline-actions">
              <button type="submit" className="btn btn-solid">
                {editingMenuId ? 'Update Item' : 'Create Item'}
              </button>
              {editingMenuId && (
                <button type="button" className="btn btn-outline" onClick={resetMenuForm}>
                  Cancel
                </button>
              )}
            </div>
          </form>

          <div className="panel">
            <h3>Menu Inventory</h3>
            <div className="stack-list">
              {menuItems.map((item) => (
                <article key={item.id} className="list-card">
                  <div className="list-head">
                    <strong>{item.name}</strong>
                    <span className={`status ${item.is_available === 1 ? 'confirmed' : 'cancelled'}`}>
                      {item.is_available === 1 ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </div>
                  <p>{item.category} | Rs. {Number(item.price).toFixed(2)}</p>
                  <div className="inline-actions">
                    <button type="button" className="btn btn-outline" onClick={() => editMenuItem(item)}>
                      Edit
                    </button>
                    <button type="button" className="btn btn-outline" onClick={() => disableMenuItem(item.id)}>
                      Disable
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      )}

      {!loading && activeTab === 'orders' && (
        <div className="panel">
          <h3>Order Management</h3>
          <div className="stack-list">
            {orders.map((order) => {
              const draft = orderDrafts[order.id] || {
                status: order.status,
                paymentStatus: order.payment_status
              };

              return (
                <article key={order.id} className="list-card">
                  <div className="list-head">
                    <strong>Order #{order.id}</strong>
                    <span>{order.customer_name} ({order.customer_email})</span>
                  </div>
                  <p>Total: Rs. {Number(order.total_amount).toFixed(2)}</p>
                  <p>Address: {order.delivery_address}</p>
                  <div className="order-items">
                    {order.items.map((item) => (
                      <div key={`${order.id}-${item.menu_item_id}`} className="order-item-row">
                        <span>{item.name}</span>
                        <span>{item.quantity} x Rs. {Number(item.price_each).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="inline-actions wrap">
                    <select
                      value={draft.status}
                      onChange={(event) => updateOrderDraft(order.id, 'status', event.target.value)}
                    >
                      {ORDER_STATUS_OPTIONS.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                    <select
                      value={draft.paymentStatus}
                      onChange={(event) => updateOrderDraft(order.id, 'paymentStatus', event.target.value)}
                    >
                      {PAYMENT_STATUS_OPTIONS.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                    <button type="button" className="btn btn-solid" onClick={() => saveOrderStatus(order.id)}>
                      Save
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      )}

      {!loading && activeTab === 'reservations' && (
        <div className="panel">
          <h3>Reservation Management</h3>
          <div className="stack-list">
            {reservations.map((reservation) => (
              <article key={reservation.id} className="list-card">
                <div className="list-head">
                  <strong>{reservation.customer_name}</strong>
                  <span>{reservation.customer_email}</span>
                </div>
                <p>{new Date(reservation.reservation_datetime).toLocaleString()}</p>
                <p>Guests: {reservation.guests}</p>
                {reservation.special_request && <p>Request: {reservation.special_request}</p>}
                <div className="inline-actions wrap">
                  {RESERVATION_STATUS_OPTIONS.map((status) => (
                    <button
                      key={status}
                      type="button"
                      className={`btn ${reservation.status === status ? 'btn-solid' : 'btn-outline'}`}
                      onClick={() => saveReservationStatus(reservation.id, status)}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
