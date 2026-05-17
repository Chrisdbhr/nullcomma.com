import React from 'react'
import { LAUNCHER_INSTALLER_URL } from '../utils';

function LauncherCTA() {
  return (
    <div className="launcher-cta-compact">
      <a
        href={LAUNCHER_INSTALLER_URL}
        className="button-primary launcher-download-btn"
      >
        <i className="fas fa-download"></i>
      </a>
    </div>
  )
}

export default LauncherCTA
