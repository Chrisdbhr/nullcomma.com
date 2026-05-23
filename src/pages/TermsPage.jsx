import { Link } from 'react-router-dom';

function TermsPage() {
  return (
    <div className="page-content fade-in" style={{ maxWidth: '720px', margin: '0 auto' }}>
      <Link to="/" className="button-back">&larr; Back to nullcomma.com</Link>

      <div className="glass-content-card">
        <h1 style={{ color: 'var(--color-light)', fontSize: '2rem', marginBottom: '0.5rem' }}>Terms of Service</h1>
        <p style={{ color: 'var(--color-grey)', marginBottom: '1.5rem' }}>These terms apply to all Null Comma products: this website, games, tools, applications, and any services or integrations provided under the Null Comma brand.</p>

        <h2 style={{ color: 'var(--color-purple)', fontSize: '1.3rem', marginTop: '2rem', marginBottom: '0.75rem' }}>Scope</h2>
        <p>These Terms of Service govern your use of all digital products and services created and distributed by Null Comma, including but not limited to: the nullcomma.com website, downloadable games and prototypes, the Null Comma Launcher, web applications, browser extensions, and any future tools or applications released under this brand.</p>

        <h2 style={{ color: 'var(--color-purple)', fontSize: '1.3rem', marginTop: '2rem', marginBottom: '0.75rem' }}>1. Content Ownership</h2>
        <p>All games, screenshots, videos, text, code, designs, and other content created and distributed by Null Comma are the property of Christopher Ravailhe and their respective creators. Unauthorized reproduction, distribution, or commercial use is prohibited unless explicitly stated or licensed otherwise.</p>

        <h2 style={{ color: 'var(--color-purple)', fontSize: '1.3rem', marginTop: '2rem', marginBottom: '0.75rem' }}>2. Permitted Use</h2>
        <p>You may browse, download, and use Null Comma products for personal, non-commercial purposes. Commercial use, redistribution, modification, reverse engineering, or incorporation into other products without written permission is not allowed. Exceptions may apply for open-source components explicitly released under permissive licenses.</p>

        <h2 style={{ color: 'var(--color-purple)', fontSize: '1.3rem', marginTop: '2rem', marginBottom: '0.75rem' }}>3. Third-Party Services</h2>
        <p>Some Null Comma products may integrate with or embed content from third-party services:</p>
        <p><strong>Steam:</strong> Games may use Steamworks SDK features (achievements, cloud saves, leaderboards). These services are governed by Valve's terms and privacy policies. Null Comma is not affiliated with Valve.</p>
        <p><strong>YouTube:</strong> This website embeds video trailers from YouTube. YouTube has its own terms and privacy policies. This site is not affiliated with YouTube or Google.</p>
        <p><strong>Formspree:</strong> The contact form uses Formspree to deliver messages. Formspree has its own terms and privacy policies.</p>
        <p><strong>Directus CMS:</strong> This website uses a self-hosted Directus instance for content management. Directus is governed by its own license and terms.</p>
        <p><strong>Analytics:</strong> Some games and applications may include anonymous analytics for quality assurance. These services process aggregated, non-identifiable data to help identify crashes and improve product stability.</p>

        <h2 style={{ color: 'var(--color-purple)', fontSize: '1.3rem', marginTop: '2rem', marginBottom: '0.75rem' }}>4. Authentication</h2>
        <p>Some Null Comma applications may offer sign-in through third-party OAuth providers (such as Google, Steam, or others). By using OAuth authentication, you agree to the terms and privacy policies of the chosen provider. Null Comma does not store your password and only accesses the minimum profile information necessary for the application to function. You may revoke access at any time through the provider's settings.</p>

        <h2 style={{ color: 'var(--color-purple)', fontSize: '1.3rem', marginTop: '2rem', marginBottom: '0.75rem' }}>5. Privacy & Data</h2>
        <p>Null Comma products are designed to minimize data collection. The website does not use cookies, tracking scripts, analytics services, or OAuth logins. Some games and applications may include optional anonymous analytics for quality assurance and bug reporting. See the <a href="/privacy">Privacy Policy</a> for full details, including LGPD compliance and your data rights.</p>

        <h2 style={{ color: 'var(--color-purple)', fontSize: '1.3rem', marginTop: '2rem', marginBottom: '0.75rem' }}>6. Software Distribution</h2>
        <p>Null Comma games and applications are distributed through this website, Steam, itch.io, and other platforms as applicable. Downloads are provided at no cost unless otherwise stated. Availability of downloads is not guaranteed and may be discontinued at any time.</p>

        <h2 style={{ color: 'var(--color-purple)', fontSize: '1.3rem', marginTop: '2rem', marginBottom: '0.75rem' }}>7. Limitation of Liability</h2>
        <p>All Null Comma products are provided "as is" without warranties of any kind, express or implied, including but not limited to merchantability, fitness for a particular purpose, and non-infringement. The owner is not liable for any damages arising from the use of, or inability to use, any Null Comma product or its content.</p>

        <h2 style={{ color: 'var(--color-purple)', fontSize: '1.3rem', marginTop: '2rem', marginBottom: '0.75rem' }}>8. Updates and Changes</h2>
        <p>These terms may be updated at any time. Changes will be reflected on this page with an updated "Last updated" date. Continued use of any Null Comma product after changes constitutes acceptance of the updated terms.</p>

        <h2 style={{ color: 'var(--color-purple)', fontSize: '1.3rem', marginTop: '2rem', marginBottom: '0.75rem' }}>9. Contact</h2>
        <p>Email: <a href="mailto:contact@nullcomma.com">contact@nullcomma.com</a></p>

        <p style={{ color: 'var(--color-grey)', fontSize: '0.85rem', marginTop: '2rem' }}>Last updated: May 2026</p>
      </div>
    </div>
  );
}

export default TermsPage;
