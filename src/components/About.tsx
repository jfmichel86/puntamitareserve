export default function About() {
  return (
    <section id="about">
      <div className="about-stats-row">
        <div className="about-stat reveal">
          <div className="stat-number">150+</div>
          <div className="stat-label">Properties across Punta Mita</div>
        </div>
        <div className="about-stat reveal">
          <div className="stat-number">15 yrs</div>
          <div className="stat-label">Combined local expertise in the region</div>
        </div>
        <div className="about-stat reveal">
          <div className="stat-number">100%</div>
          <div className="stat-label">Homes personally visited before we recommend them</div>
        </div>
      </div>

      <div className="about-body">
        <div className="about-text">
          <p className="s-body">Before you book, you can speak with someone who has been inside the home you&rsquo;re considering, knows which views are genuinely worth the premium, and will tell you honestly if a different property is a better match for your group. That kind of advice doesn&rsquo;t exist on a booking platform.</p>
          <p className="s-body">We&rsquo;ve spent years building relationships with property owners across Punta Mita — and with the restaurants, chefs, and experience providers who make a stay memorable. When you book with us, that network is yours.</p>
          <a href="https://wa.me/523313619889" className="about-cta reveal" target="_blank" rel="noopener">Talk to us <svg viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></a>
        </div>

        <div>
          <p className="svc-label">Your stay, handled</p>
          <div className="svc-list">
            {[
              ['Airport transfers', 'Reliable transportation from PVR — door to door from arrival.'],
              ['Experiences', 'Surf lessons, fishing charters, ATV tours, snorkeling and more.'],
              ['Private chef', 'From casual breakfasts to full dinner parties — professionally handled.'],
              ['Wellness & spa', 'In-villa massages, yoga, and wellness sessions — arranged on request.'],
              ['Private childcare', 'Trusted, vetted childcare so parents can enjoy their time away.'],
              ['Restaurant reservations', 'We secure the tables that are hardest to get — Four Seasons and beyond.'],
            ].map(([name, desc]) => (
              <div className="svc-item reveal" key={name}>
                <div className="svc-name">{name}</div>
                <div className="svc-desc">{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
