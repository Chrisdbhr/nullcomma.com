import { Link } from 'react-router-dom';

function PrivacyPage() {
  return (
    <div className="page-content fade-in" style={{ maxWidth: '720px', margin: '0 auto' }}>
      <Link to="/" className="button-back">&larr; Back to nullcomma.com</Link>

      <div className="sidebar-info-box" style={{ marginTop: '20px' }}>
        <h1 style={{ color: 'var(--color-light)', fontSize: '2rem', marginBottom: '0.5rem' }}>Privacy Policy</h1>

        <h2 style={{ color: 'var(--color-purple)', fontSize: '1.3rem', marginTop: '2rem', marginBottom: '0.75rem' }}>Data Collection</h2>
        <p>This site does not collect, store, or share any personal data. No cookies, no tracking scripts, no analytics services.</p>

        <h2 style={{ color: 'var(--color-purple)', fontSize: '1.3rem', marginTop: '2rem', marginBottom: '0.75rem' }}>Contact Form</h2>
        <p>The contact form sends your message through <a href="https://formspree.io">Formspree</a>, which processes it privately. I do not retain, sell, or access your submitted data beyond responding to your message.</p>

        <h2 style={{ color: 'var(--color-purple)', fontSize: '1.3rem', marginTop: '2rem', marginBottom: '0.75rem' }}>Third-Party Embeds</h2>
        <p>This site embeds content from YouTube (video trailers) and Steam (widgets). Those services have their own privacy policies. This site is not affiliated with Valve, YouTube, or Google.</p>

        <h2 style={{ color: 'var(--color-purple)', fontSize: '1.3rem', marginTop: '2rem', marginBottom: '0.75rem' }}>Contact</h2>
        <p>Email: <a href="mailto:contact@nullcomma.com">contact@nullcomma.com</a></p>

        <p style={{ color: 'var(--color-grey)', fontSize: '0.85rem', marginTop: '2rem' }}>Last updated: May 2026</p>
      </div>
    </div>
  );
}

export default PrivacyPage;
