import React from 'react'
import { LAUNCHER_INSTALLER_URL } from '../utils';


// Puxa a mesma URL do DownloadButton


function LauncherCTA() {
  return (
    <div className="launcher-cta-container">
      <div className="launcher-cta-icon">🚀</div>
      <div className="launcher-cta-content">
        <h3>Check out the Official Launcher</h3>
        <p>
          The easiest way to download and keep all my games
          always up to date, right on your PC.
        </p>
      </div>
      <div className="launcher-cta-action">
        <a 
          href={LAUNCHER_INSTALLER_URL} 
          className="button-primary"
        >
          Download Launcher
        </a>
      </div>
    </div>
  )
}

export default LauncherCTA
