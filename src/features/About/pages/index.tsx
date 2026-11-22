import { Link } from "react-router-dom";
import { Header, Footer } from "../../../components";
import "./index.css";

const AboutPage = () => <div className="about-page">
  <Header />
  <main className="about-content">
    <section className="about-introduction"><div><p className="about-eyebrow">About Travel Guroo</p><h1>Less time planning.<br />More time exploring.</h1><p>Travel Guroo brings tours, activities, transfers, and multi-day packages into one place. Explore destinations, compare what’s included, and choose the experience that fits your plans.</p><Link to="/services" className="about-primary-link">Explore experiences</Link></div><img src="/assets/AbuDhabi.jpg" alt="The Abu Dhabi waterfront" /></section>
    <section className="about-booking"><h2>Know what you’re booking</h2><div className="about-booking-grid"><div><h3>Choose your destination</h3><p>Browse experiences by country, then narrow down the options by location and budget.</p></div><div><h3>Read the package details</h3><p>Review the price, inclusions, itinerary, and cancellation terms. For multi-day trips, choose a start date to see the full travel range.</p></div><div><h3>Keep your plans together</h3><p>Sign in to book and find your booking details and voucher in your account.</p></div></div></section>
    <section className="about-help"><div><h2>Need a hand with your plans?</h2><p>Ask us about a package, travel dates, or an existing booking.</p></div><Link to="/contact">Contact our team</Link></section>
  </main>
  <Footer />
</div>;
export default AboutPage;
