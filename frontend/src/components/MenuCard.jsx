function MenuCard({ item, onAdd }) {
  return (
    <article className="menu-card">
      <img
        src={item.image_url || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80'}
        alt={item.name}
        className="menu-image"
      />
      <div className="menu-body">
        <div className="menu-meta">
          <span className="badge">{item.category}</span>
          <span className="price">Rs. {Number(item.price).toFixed(2)}</span>
        </div>
        <h3>{item.name}</h3>
        <p>{item.description}</p>
        <button type="button" className="btn btn-solid full-width" onClick={() => onAdd(item)}>
          Add to Cart
        </button>
      </div>
    </article>
  );
}

export default MenuCard;
