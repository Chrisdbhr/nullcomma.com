import React from 'react'
import { LAUNCHER_INSTALLER_URL } from '../utils';

function LauncherCTA() {
  return (
    <div className="launcher-cta-mini">
      <h3>Download Launcher</h3>
      <a
        href={LAUNCHER_INSTALLER_URL}
        className="button-primary"
      >
        <i className="fas fa-download"></i>
      </a>
    </div>
  )
}

export default LauncherCTA
