import { Link } from 'react-router-dom';

function TermsPage() {
  return (
    <div className="page-content fade-in" style={{ maxWidth: '720px', margin: '0 auto' }}>
      <Link to="/" className="button-back">&larr; Back to nullcomma.com</Link>

      <div className="sidebar-info-box" style={{ marginTop: '20px' }}>
        <h1 style={{ color: 'var(--color-light)', fontSize: '2rem', marginBottom: '0.5rem' }}>Terms of Service</h1>

        <h2 style={{ color: 'var(--color-purple)', fontSize: '1.3rem', marginTop: '2rem', marginBottom: '0.75rem' }}>1. Content</h2>
        <p>All games, screenshots, videos, text, and other content on this site are the property of their respective creators. Unauthorized reproduction or distribution is prohibited unless explicitly stated.</p>

        <h2 style={{ color: 'var(--color-purple)', fontSize: '1.3rem', marginTop: '2rem', marginBottom: '0.75rem' }}>2. Use</h2>
        <p>You may browse and download content for personal, non-commercial use. Commercial use, redistribution, or modification of content without written permission is not allowed.</p>

        <h2 style={{ color: 'var(--color-purple)', fontSize: '1.3rem', marginTop: '2rem', marginBottom: '0.75rem' }}>3. Third-Party Services</h2>
        <p>This site embeds content from YouTube (video trailers) and Steam (widgets). Those services have their own terms and privacy policies. This site is not affiliated with Valve, YouTube, or Google.</p>

        <h2 style={{ color: 'var(--color-purple)', fontSize: '1.3rem', marginTop: '2rem', marginBottom: '0.75rem' }}>4. Privacy & Data</h2>
        <p>This site does not use cookies, tracking scripts, analytics services, or OAuth logins. No personal data is collected, stored, or shared. The contact form sends your message through <a href="https://formspree.io">Formspree</a>, which processes it privately — I do not retain, sell, or access your submitted data beyond responding to your message.</p>

        <h2 style={{ color: 'var(--color-purple)', fontSize: '1.3rem', marginTop: '2rem', marginBottom: '0.75rem' }}>5. Limitation of Liability</h2>
        <p>This site is provided "as is" without warranties of any kind. The owner is not liable for any damages arising from the use of this site or its content.</p>

        <h2 style={{ color: 'var(--color-purple)', fontSize: '1.3rem', marginTop: '2rem', marginBottom: '0.75rem' }}>6. Changes</h2>
        <p>These terms may be updated at any time. Continued use of the site after changes constitutes acceptance of the updated terms.</p>

        <h2 style={{ color: 'var(--color-purple)', fontSize: '1.3rem', marginTop: '2rem', marginBottom: '0.75rem' }}>7. Contact</h2>
        <p>Email: <a href="mailto:contact@nullcomma.com">contact@nullcomma.com</a></p>

        <p style={{ color: 'var(--color-grey)', fontSize: '0.85rem', marginTop: '2rem' }}>Last updated: May 2026</p>
      </div>
    </div>
  );
}

export default TermsPage;
