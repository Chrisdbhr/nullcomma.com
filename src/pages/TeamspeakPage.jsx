import { useState } from 'react';
import { FaDownload, FaCopy, FaDiscord, FaCheck } from 'react-icons/fa';

const TS_SERVER = 'teamspeak.chrisjogos.com';
const TS3_LINK = `ts3server://${TS_SERVER}`;
const TS_DOWNLOAD_URL = 'https://teamspeak.com/en/downloads';

function TeamspeakPage() {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(TS_SERVER);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <div className="page-content fade-in" style={{ maxWidth: '680px', margin: '0 auto' }}>
      <div className="glass-content-card" style={{ textAlign: 'center' }}>
        <h1 style={{ color: 'var(--color-light)', fontSize: '2.2rem', marginBottom: '0.5rem' }}>
          TeamSpeak 3
        </h1>
        <p style={{ color: 'var(--color-grey)', marginBottom: '2rem', fontSize: '1.1rem' }}>
          Join the Null Comma community on TeamSpeak
        </p>

        <div className="ts-server-box" style={{
          background: 'var(--color-darkest)',
          border: '1px solid var(--color-dark)',
          borderRadius: 'var(--border-radius)',
          padding: '20px',
          marginBottom: '24px',
        }}>
          <p style={{ color: 'var(--color-grey)', fontSize: '0.9rem', marginBottom: '8px' }}>Server Address</p>
          <p style={{
            fontFamily: 'monospace',
            fontSize: '1.4rem',
            fontWeight: '700',
            color: 'var(--color-light)',
            marginBottom: '12px',
            wordBreak: 'break-all',
          }}>
            {TS_SERVER}
          </p>
          <button onClick={handleCopy} className="button-secondary" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.9rem',
          }}>
            {copied ? <><FaCheck /> Copied!</> : <><FaCopy /> Copy Address</>}
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
          <a
            href={TS3_LINK}
            className="button-primary"
            style={{ fontSize: '1.1rem', padding: '14px 20px' }}
          >
            Open in TeamSpeak
          </a>
          <a
            href={TS_DOWNLOAD_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="button-secondary"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontSize: '1rem',
              padding: '12px 20px',
            }}
          >
            <FaDownload /> Download TeamSpeak 3
          </a>
        </div>

        <div style={{
          borderTop: '1px solid var(--color-dark)',
          paddingTop: '20px',
        }}>
          <p style={{ color: 'var(--color-grey)', marginBottom: '12px' }}>
            Password required? Get it from the Discord server
          </p>
          <a
            href="https://discord.nullcomma.com"
            target="_blank"
            rel="noopener noreferrer"
            className="community-discord-btn"
            style={{ display: 'inline-flex' }}
          >
            <FaDiscord /> Join Discord
          </a>
        </div>
      </div>
    </div>
  );
}

export default TeamspeakPage;
