import React, { useState, useEffect, useCallback } from 'react';
import { baseURL } from '../utils';
import { fetchJsonCms } from '../utils/staticData';

const RECHECK_MS = 120000;

/**
 * Shows a fixed banner when the CMS (cms.nullcomma.com) is unreachable,
 * letting visitors know the site is running in recovery mode.
 */
function StatusBanner() {
  const [status, setStatus] = useState('checking');
  const [checking, setChecking] = useState(false);

  const check = useCallback(async () => {
    setChecking(true);
    try {
      await fetchJsonCms(`${baseURL}/items/projects?limit=1&fields=id`, 5000);
      setStatus('ok');
    } catch (err) {
      setStatus('down');
    } finally {
      setChecking(false);
    }
  }, []);

  useEffect(() => {
    check();
    const timer = setInterval(check, RECHECK_MS);
    return () => clearInterval(timer);
  }, [check]);

  if (status === 'checking') return null;
  if (status === 'ok') return null;

  return (
    <div className="cms-status-banner" role="status">
      <span>
        The site is currently running in recovery mode. Some features (images, updates,
        downloads) may be unavailable while the content service is offline.
      </span>
      <button type="button" onClick={check} disabled={checking} className={checking ? 'checking' : ''}>
        {checking ? <span className="banner-spinner" aria-hidden="true" /> : null}
        {checking ? 'Checking...' : 'Check again'}
      </button>
    </div>
  );
}

export default StatusBanner;
