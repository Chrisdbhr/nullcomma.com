import React from 'react'
import { LAUNCHER_INSTALLER_URL } from '../utils';

function LauncherCTA() {
  return (
    <a
      href={LAUNCHER_INSTALLER_URL}
      className="launcher-cta-mini"
    >
      <span className="launcher-cta-mini-icon"><i className="fas fa-download"></i></span>
      <span className="launcher-cta-mini-text">Download Launcher</span>
    </a>
  )
}

export default LauncherCTA
