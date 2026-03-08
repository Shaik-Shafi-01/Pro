import { useEffect, useState } from 'react';
import { apiRequest } from '../api';
import { useCart } from '../context/CartContext';
import MenuCard from '../components/MenuCard';

function Menu() {
  const { addToCart } = useCart();
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    apiRequest('/menu/categories')
      .then((data) => setCategories(['All', ...data]))
      .catch(() => setCategories(['All']));
  }, []);

  useEffect(() => {
    const fetchMenu = async () => {
      setLoading(true);
      setError('');
      try {
        const endpoint =
          selectedCategory === 'All'
            ? '/menu'
            : `/menu?category=${encodeURIComponent(selectedCategory)}`;
        const data = await apiRequest(endpoint);
        setItems(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, [selectedCategory]);

  return (
    <div className="container section">
      <div className="section-head">
        <h2>Our Menu</h2>
        <p>Freshly prepared dishes categorized for easy discovery.</p>
      </div>

      <div className="filter-row">
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            className={`chip ${selectedCategory === category ? 'active' : ''}`}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      {error && <p className="alert error">{error}</p>}
      {loading && <p className="panel">Loading menu...</p>}

      {!loading && items.length === 0 && <p className="panel">No menu items available for this category.</p>}

      <div className="menu-grid">
        {items.map((item) => (
          <MenuCard key={item.id} item={item} onAdd={addToCart} />
        ))}
      </div>
    </div>
  );
}

export default Menu;
