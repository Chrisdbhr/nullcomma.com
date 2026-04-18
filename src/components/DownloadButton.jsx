import React, { useState, useEffect, useRef } from 'react'
import { LAUNCHER_INSTALLER_URL } from '../utils';



function DownloadButton({ project }) {
  const [showInstallerLink, setShowInstallerLink] = useState(false);
  const timeoutRef = useRef(null);

  const handleDownloadClick = () => {
    timeoutRef.current = setTimeout(() => {
      setShowInstallerLink(true);
    }, 2500); // 2.5 segundos de espera

    window.location.href = `chrisjogos://install/${project.id}`;
  };
  
  useEffect(() => {
    const handleBlur = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
    
    window.addEventListener('blur', handleBlur);
    return () => {
      window.removeEventListener('blur', handleBlur);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  if (showInstallerLink) {
    return (
      <div className="download-fallback">
        <p>It looks like you don't have the Launcher installed.</p>
        <a 
          href={LAUNCHER_INSTALLER_URL} 
          className="button-primary button-download"
        >
          Download Launcher
        </a>
         <button onClick={() => setShowInstallerLink(false)} className="button-secondary">
           I have it, try again
         </button>
      </div>
    );
  }

  return (
    <button 
      onClick={handleDownloadClick} 
      className="button-primary button-download"
    >
      Play via Launcher
      {project.latest_version && <span>Version {project.latest_version}</span>}
    </button>
  )
}

export default DownloadButton