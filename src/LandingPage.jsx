import React, { useEffect, useState } from 'react';
import './LandingPage.css';

export default function LandingPage(){
  const [navOpen, setNavOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const year = new Date().getFullYear();

  useEffect(()=>{
    const prevTitle = document.title;
    document.title = "BeauBook — Booking & Business Management for Beauty & Wellness";
    return ()=>{ document.title = prevTitle; };
  },[]);

  useEffect(()=>{
    const onScroll = ()=> setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive:true });
    return ()=> window.removeEventListener('scroll', onScroll);
  },[]);

  useEffect(()=>{
    const sections = ['about','mission','benefits','features','contact']
      .map(id=>document.getElementById(id))
      .filter(Boolean);
    const observer = new IntersectionObserver((entries)=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting) setActiveSection(entry.target.id);
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(s=>observer.observe(s));
    return ()=> observer.disconnect();
  },[]);

  useEffect(()=>{
    const els = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver((entries)=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting){
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    els.forEach(el=>observer.observe(el));
    return ()=> observer.disconnect();
  },[]);

  const closeNav = ()=> setNavOpen(false);
  const navClass = (id)=> activeSection===id ? 'active' : undefined;

  return (
    <div className="landing">
      <header className={`site-header${scrolled ? ' scrolled' : ''}`}>
        <div className="container header-inner">
          <a href="#home" className="logo">
            <span className="logo-mark" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 10h18"/><path d="m9 15 2 2 4-4"/></svg>
            </span>
            Beau<span>Book</span>
          </a>

          <nav className={`main-nav${navOpen ? ' open' : ''}`}>
            <a href="#about" className={navClass('about')} onClick={closeNav}>About</a>
            <a href="#mission" className={navClass('mission')} onClick={closeNav}>Mission</a>
            <a href="#benefits" className={navClass('benefits')} onClick={closeNav}>Benefits</a>
            <a href="#features" className={navClass('features')} onClick={closeNav}>Functions</a>
            <a href="#contact" className={navClass('contact')} onClick={closeNav}>Contact</a>
          </nav>

          <div className="header-actions">
            <a href="/merchantdash" className="btn btn-ghost btn-sm">Merchant Login</a>
            <a href="#contact" className="btn btn-primary btn-sm">Get Started</a>
            <button
              className={`nav-toggle${navOpen ? ' open' : ''}`}
              aria-label="Toggle menu"
              aria-expanded={navOpen}
              onClick={()=>setNavOpen(o=>!o)}
            >
              <span></span><span></span><span></span>
            </button>
          </div>
        </div>
      </header>

      <main>
        {/* HERO */}
        <section className="hero" id="home">
          <div className="container hero-inner">
            <div className="hero-copy reveal">
              <p className="eyebrow">Booking &amp; business management, simplified</p>
              <h1>Run your beauty business beautifully.</h1>
              <p className="hero-sub">
                BeauBook brings appointments, staff schedules, inventory, and customers
                together in one calm, organized dashboard — so you can spend less time
                juggling spreadsheets and more time with your clients.
              </p>
              <div className="hero-actions">
                <a href="#contact" className="btn btn-primary">Get Started</a>
                <a href="#features" className="btn btn-ghost">See what it does</a>
              </div>
            </div>

            <div className="hero-visual reveal" aria-hidden="true">
              <div className="mock-card">
                <div className="mock-card-header">
                  <span className="dot dot-a"></span><span className="dot dot-b"></span><span className="dot dot-c"></span>
                  <span className="mock-title">Today's Schedule</span>
                </div>
                <div className="mock-body">
                  <div className="mock-row">
                    <span className="mock-time">9:00</span>
                    <span className="mock-pill mock-confirmed">Mei Ling — Haircut &amp; Style</span>
                  </div>
                  <div className="mock-row">
                    <span className="mock-time">10:30</span>
                    <span className="mock-pill mock-pending">Farah A. — Manicure</span>
                  </div>
                  <div className="mock-row">
                    <span className="mock-time">11:15</span>
                    <span className="mock-pill mock-sale">Walk-in — Product Sale</span>
                  </div>
                  <div className="mock-row">
                    <span className="mock-time">1:00</span>
                    <span className="mock-pill mock-confirmed">Wei Jun — Facial Treatment</span>
                  </div>
                  <div className="mock-row">
                    <span className="mock-time">2:30</span>
                    <span className="mock-pill mock-unassigned">Open Slot</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ABOUT */}
        <section className="section" id="about">
          <div className="container about-inner">
            <div className="reveal">
              <p className="eyebrow">What is BeauBook</p>
              <h2>One dashboard for everything your salon runs on.</h2>
            </div>
            <div className="about-grid">
              <p className="reveal">
                BeauBook was built for salons, spas, barbershops, and beauty studios that
                are done juggling paper booking books, group chats, and spreadsheets.
                It brings your calendar, your team, your product shelf, and your
                customer list into a single place — accessible from any device, updated
                in real time.
              </p>
              <p className="reveal">
                Whether you're a solo stylist managing your own chair or a multi-staff
                studio with rooms, shifts, and leave to track, BeauBook adapts to how
                your business actually runs — not the other way around.
              </p>
            </div>
          </div>
        </section>

        {/* MISSION & VISION */}
        <section className="section section-tint" id="mission">
          <div className="container">
            <div className="reveal">
              <p className="eyebrow">Why we build BeauBook</p>
              <h2>Our mission &amp; vision</h2>
            </div>

            <div className="mv-grid">
              <div className="mv-card reveal">
                <div className="mv-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2 3 6v6c0 5 3.8 9.4 9 10 5.2-.6 9-5 9-10V6l-9-4Z"/><path d="m9 12 2 2 4-4"/></svg>
                </div>
                <h3>Mission</h3>
                <p>
                  To give beauty and wellness businesses simple, powerful tools that
                  hand them back their most valuable resource — time — so they can
                  focus on their craft and their clients, not their admin.
                </p>
              </div>

              <div className="mv-card reveal">
                <div className="mv-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/></svg>
                </div>
                <h3>Vision</h3>
                <p>
                  A world where every salon, spa, and studio — no matter its size —
                  has access to the same quality of business tools as the biggest
                  chains, without the enterprise price tag or complexity.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* BENEFITS */}
        <section className="section" id="benefits">
          <div className="container">
            <div className="reveal">
              <p className="eyebrow">Our benefits</p>
              <h2>Why businesses choose BeauBook</h2>
            </div>

            <div className="card-grid">
              <div className="feature-card reveal">
                <div className="feature-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
                </div>
                <h3>Save time every day</h3>
                <p>Automated scheduling and reminders cut down the back-and-forth of manual booking and rebooking.</p>
              </div>

              <div className="feature-card reveal">
                <div className="feature-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="M7 15v3M12 10v8M17 6v12"/></svg>
                </div>
                <h3>Grow your revenue</h3>
                <p>Track product sales alongside services, spot your best sellers, and reduce lost revenue from no-shows.</p>
              </div>

              <div className="feature-card reveal">
                <div className="feature-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18M8 2v4M16 2v4"/></svg>
                </div>
                <h3>Stay organized</h3>
                <p>Staff schedules, leave, seats, and services all live in one calendar — no more juggling separate systems.</p>
              </div>

              <div className="feature-card reveal">
                <div className="feature-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 1 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z"/></svg>
                </div>
                <h3>Delight your customers</h3>
                <p>A smoother booking experience and timely reminders mean fewer missed appointments and happier regulars.</p>
              </div>

              <div className="feature-card reveal">
                <div className="feature-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><rect x="7" y="12" width="3" height="6"/><rect x="12" y="8" width="3" height="10"/><rect x="17" y="5" width="3" height="13"/></svg>
                </div>
                <h3>See it all at a glance</h3>
                <p>Real-time analytics on bookings, staff performance, and product sales — export reports whenever you need them.</p>
              </div>

              <div className="feature-card reveal">
                <div className="feature-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="10" width="16" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>
                </div>
                <h3>Secure by design</h3>
                <p>Your data lives in a managed cloud database with encrypted access — built to be reliable, not fragile.</p>
              </div>
            </div>
          </div>
        </section>

        {/* FUNCTIONS / FEATURES */}
        <section className="section section-tint" id="features">
          <div className="container">
            <div className="reveal">
              <p className="eyebrow">Our functions</p>
              <h2>Everything your front desk needs</h2>
            </div>

            <div className="card-grid card-grid-4">
              <div className="feature-card feature-card-sm reveal">
                <div className="feature-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 10h18"/></svg>
                </div>
                <h3>Calendar &amp; bookings</h3>
                <p>Day and week views, color-coded statuses, and drag-friendly scheduling.</p>
              </div>

              <div className="feature-card feature-card-sm reveal">
                <div className="feature-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                </div>
                <h3>Staff management</h3>
                <p>Profiles, skills, positions, and emergency contacts, all in one roster.</p>
              </div>

              <div className="feature-card feature-card-sm reveal">
                <div className="feature-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/><path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/></svg>
                </div>
                <h3>Leave &amp; scheduling</h3>
                <p>Track staff leave and working hours so shifts never get double-booked.</p>
              </div>

              <div className="feature-card feature-card-sm reveal">
                <div className="feature-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 8 12 3 3 8l9 5 9-5Z"/><path d="M3 8v8l9 5 9-5V8M12 13v8"/></svg>
                </div>
                <h3>Product &amp; inventory</h3>
                <p>Manage your shelf, pricing, and stock — sell products alongside services.</p>
              </div>

              <div className="feature-card feature-card-sm reveal">
                <div className="feature-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21a8 8 0 1 0-16 0"/><circle cx="12" cy="7" r="4"/></svg>
                </div>
                <h3>Customer profiles</h3>
                <p>Contact details, notes, and visit history for every client who walks in.</p>
              </div>

              <div className="feature-card feature-card-sm reveal">
                <div className="feature-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>
                </div>
                <h3>Payments &amp; sales</h3>
                <p>Track paid, unpaid, and partial payments, plus tips and transaction IDs.</p>
              </div>

              <div className="feature-card feature-card-sm reveal">
                <div className="feature-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-4 4"/></svg>
                </div>
                <h3>Analytics &amp; reports</h3>
                <p>Visual breakdowns of bookings and product sales — export to CSV anytime.</p>
              </div>

              <div className="feature-card feature-card-sm reveal">
                <div className="feature-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/></svg>
                </div>
                <h3>Notifications</h3>
                <p>Upcoming-appointment alerts so nothing slips through the cracks.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CONTACT */}
        <section className="section" id="contact">
          <div className="container contact-inner">
            <div className="contact-info reveal">
              <p className="eyebrow">Get in touch</p>
              <h2>Let's talk about your business.</h2>
              <p className="hero-sub">
                Have questions about BeauBook, or want a walkthrough for your salon,
                spa, or studio? Reach out — we'd love to hear from you.
              </p>

              <ul className="contact-list">
                <li>
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 6-10 7L2 6"/></svg>
                  <a href="mailto:hello@beaubook.my">hello@beaubook.my</a>
                </li>
                <li>
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.1-8.6A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.7a2 2 0 0 1-.5 2.1L8 9.7a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.5 2.7.6a2 2 0 0 1 1.7 2Z"/></svg>
                  <a href="tel:+60123456789">+60 12-345 6789</a>
                </li>
                <li>
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                  <span>Kuala Lumpur, Malaysia</span>
                </li>
              </ul>

              <div className="social-row">
                <a href="#" aria-label="Facebook" className="social-btn">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3Z"/></svg>
                </a>
                <a href="#" aria-label="Instagram" className="social-btn">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17.5 6.5h.01"/></svg>
                </a>
                <a href="#" aria-label="WhatsApp" className="social-btn">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.5 8.5 0 0 1-12.4 7.6L3 21l1.9-5.6a8.5 8.5 0 1 1 16.1-3.9Z"/><path d="M8.5 9.5c.5 2.5 2.5 4.5 5 5"/></svg>
                </a>
              </div>
            </div>

            <form className="contact-form reveal" action="mailto:hello@beaubook.my" method="post" encType="text/plain">
              <div className="form-row">
                <label htmlFor="name">Name</label>
                <input type="text" id="name" name="Name" placeholder="Your name" required />
              </div>
              <div className="form-row">
                <label htmlFor="email">Email</label>
                <input type="email" id="email" name="Email" placeholder="you@example.com" required />
              </div>
              <div className="form-row">
                <label htmlFor="business">Business name</label>
                <input type="text" id="business" name="Business" placeholder="e.g. Luna Beauty Studio" />
              </div>
              <div className="form-row">
                <label htmlFor="message">Message</label>
                <textarea id="message" name="Message" rows="4" placeholder="Tell us a bit about your business..." required></textarea>
              </div>
              <button type="submit" className="btn btn-primary btn-full">Send message</button>
              <p className="form-note">This opens your email app with your message ready to send.</p>
            </form>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="container footer-inner">
          <div className="footer-brand">
            <a href="#home" className="logo">
              <span className="logo-mark" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 10h18"/><path d="m9 15 2 2 4-4"/></svg>
              </span>
              Beau<span>Book</span>
            </a>
            <p>Booking &amp; business management for beauty &amp; wellness.</p>
          </div>

          <div className="footer-links">
            <a href="#about">About</a>
            <a href="#mission">Mission</a>
            <a href="#benefits">Benefits</a>
            <a href="#features">Functions</a>
            <a href="#contact">Contact</a>
            <a href="/merchantdash">Merchant Login</a>
          </div>
        </div>
        <div className="container footer-bottom">
          <p>&copy; {year} BeauBook. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
