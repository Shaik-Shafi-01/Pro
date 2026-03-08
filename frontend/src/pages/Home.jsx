import { Link } from 'react-router-dom';

function Home() {
  return (
    <div>
      <section className="hero">
        <div className="hero-overlay" />
        <div className="container hero-content">
          <p className="hero-tag">Fine Dining + Fast Delivery</p>
          <h1>Crafted flavors for every craving.</h1>
          <p>
            Discover signature Indian and global fusion dishes, reserve your table in seconds, and order online
            with secure UPI checkout.
          </p>
          <div className="hero-actions">
            <Link to="/menu" className="btn btn-solid">
              Explore Menu
            </Link>
            <Link to="/reservations" className="btn btn-outline light">
              Reserve Table
            </Link>
          </div>
        </div>
      </section>

      <section className="container info-grid">
        <article className="panel">
          <h3>About Urban Bites</h3>
          <p>
            Urban Bites blends a modern kitchen with authentic culinary roots. Every plate is prepared with
            seasonal ingredients and chef-driven techniques.
          </p>
        </article>
        <article className="panel">
          <h3>What We Serve</h3>
          <p>
            Starters, gourmet mains, healthy bowls, artisanal desserts, and hand-crafted beverages across veg
            and non-veg choices.
          </p>
        </article>
        <article className="panel">
          <h3>Online Experience</h3>
          <p>
            Browse live menu categories, add to cart, pay by UPI, track order status, and manage reservations
            from your account.
          </p>
        </article>
      </section>
    </div>
  );
}

export default Home;
