import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { baseURL, fieldsQuery, formatDate } from '../utils';
import JSZip from 'jszip';
import SafeImage from '../components/SafeImage';

const getPreferredTranslation = (translations) => {
  if (!translations || translations.length === 0) return {};
  const enTranslation = translations.find(t => t.language.startsWith('en'));
  if (enTranslation) return enTranslation;
  const ptTranslation = translations.find(t => t.language.startsWith('pt'));
  if (ptTranslation) return ptTranslation;
  return translations[0] || {};
};

async function fetchBlob(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return await res.blob();
  } catch {
    return null;
  }
}

function PressKitPage() {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [zipping, setZipping] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!projectId) return;
    const fetchProject = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${baseURL}/items/projects/${projectId}?${fieldsQuery}`);
        const data = await response.json();
        setProject(data.data);
      } catch (error) {
        console.error('Error fetching project:', error);
        setProject(null);
      }
      setLoading(false);
    };
    fetchProject();
  }, [projectId]);

  const handleDownloadZip = async () => {
    if (!project) return;
    setZipping(true);
    const zip = new JSZip();
    const translation = getPreferredTranslation(project.translations);
    const title = translation.title || 'untitled';
    const safeTitle = title.replace(/[^a-z0-9]/gi, '_').toLowerCase();

    const folder = zip.folder(`${safeTitle}_presskit`);
    folder.file('info.txt', [
      `Title: ${title}`,
      `Engine: ${project.engine || 'N/A'}`,
      `Release Date: ${project.release_date ? formatDate(project.release_date) : 'TBA'}`,
      project.playtime ? `Playtime: ${translation.playtime}` : '',
      `Tags: ${project.tags?.map(t => t.tags_id).join(', ') || 'N/A'}`,
      '',
      'Synopsis:',
      translation.synopsis || 'N/A',
      '',
      'Links:',
      project.steam_id ? `Steam: https://store.steampowered.com/app/${project.steam_id}/` : '',
      project.github_url ? `Source: ${project.github_url}` : '',
      project.web_version_url ? `Web: ${project.web_version_url}` : '',
      project.google_play_url ? `Google Play: ${project.google_play_url}` : '',
      project.app_store_url ? `App Store: ${project.app_store_url}` : '',
      project.trailer_url ? `Trailer: ${project.trailer_url}` : '',
      '',
      'About the Developer:',
      'Null Comma is the solo game development portfolio of Christopher Ravailhe, a C# developer and Unity specialist.',
      'Website: https://nullcomma.com',
    ].filter(Boolean).join('\n'));

    const cardImageId = project.card_image?.id;
    const cardImageType = project.card_image?.type;
    if (cardImageId) {
      const fullResUrl = `${baseURL}/assets/${cardImageId}`;
      const blob = await fetchBlob(fullResUrl);
      if (blob) {
        const ext = cardImageType?.split('/')[1] || 'png';
        folder.file(`logo.${ext}`, blob);
      }
    }

    const zipScreenshots = [];

    if (project.steam_screenshots?.length > 0) {
      project.steam_screenshots.forEach((ss) => {
        if (ss.path) zipScreenshots.push({ type: 'steam', url: ss.path });
      });
    }

    if (project.screenshots?.length > 0) {
      project.screenshots.forEach((ss) => {
        const fileId = ss.directus_files_id?.id;
        if (fileId) zipScreenshots.push({ type: 'directus', url: `${baseURL}/assets/${fileId}` });
      });
    }

    if (zipScreenshots.length > 0) {
      const ssFolder = folder.folder('screenshots');
      const results = await Promise.all(
        zipScreenshots.map(async (ss, i) => {
          const blob = await fetchBlob(ss.url);
          return { blob, index: i };
        })
      );

      results.forEach(({ blob, index }) => {
        if (blob) {
          ssFolder.file(`screenshot_${String(index + 1).padStart(2, '0')}.jpg`, blob);
        }
      });
    }

    const content = await zip.generateAsync({ type: 'blob' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(content);
    link.download = `${safeTitle}_presskit.zip`;
    link.click();
    URL.revokeObjectURL(link.href);
    setZipping(false);
  };

  if (loading) {
    return <div className="page-content"><h2>Loading press kit...</h2></div>;
  }

  if (!project) {
    return (
      <div className="page-content fade-in">
        <h2>Project Not Found</h2>
        <Link to="/" className="button-primary">&larr; Go back to Home</Link>
      </div>
    );
  }

  const translation = getPreferredTranslation(project.translations);
  const title = translation.title || 'Title Not Available';
  const cardImageId = project.card_image?.id;
  const cardImageType = project.card_image?.type;

  const trailerEmbedUrl = (() => {
    if (!project.trailer_url) return null;
    try {
      const videoUrl = new URL(project.trailer_url);
      if (videoUrl.hostname.includes('youtube.com')) {
        return `https://www.youtube.com/embed/${videoUrl.searchParams.get('v')}`;
      }
      return project.trailer_url;
    } catch {
      return project.trailer_url;
    }
  })();

  const allScreenshots = [];

  if (project.steam_screenshots?.length > 0) {
    project.steam_screenshots.forEach((ss) => {
      if (ss.path) allScreenshots.push({ type: 'steam', url: ss.path });
    });
  }

  if (project.screenshots?.length > 0) {
    project.screenshots.forEach((ss) => {
      const fileId = ss.directus_files_id?.id;
      if (fileId) allScreenshots.push({ type: 'directus', id: fileId });
    });
  }

  return (
    <div className="page-content fade-in presskit-page">
      <title>{`${title} — Press Kit | Null Comma`}</title>
      <meta name="description" content={`Press kit for ${title}. Download logos, screenshots, and project info.`} />

      <button onClick={() => navigate(-1)} className="button-back">&larr; Back</button>

      <div className="presskit-header">
        <h2 className="presskit-title">{title} — Press Kit</h2>
        <button
          className="button-primary presskit-download-btn"
          onClick={handleDownloadZip}
          disabled={zipping}
        >
          {zipping ? 'Generating ZIP...' : 'Download Press Kit (.zip)'}
        </button>
      </div>

      {cardImageId && (
        <div className="presskit-hero">
          <SafeImage
            id={cardImageId}
            width={1200}
            quality={80}
            mimeType={cardImageType}
            alt={title}
            className="presskit-hero-image"
          />
        </div>
      )}

      <div className="presskit-body">
        <section className="presskit-section">
          <h3>About</h3>
          <div className="presskit-synopsis">
            {translation.synopsis?.split('\n').map((line, i) => (
              <p key={i}>{line}</p>
            )) || <p>No description available.</p>}
          </div>
        </section>

        <section className="presskit-section">
          <h3>Quick Facts</h3>
          <dl className="presskit-facts">
            {project.engine && (
              <>
                <dt>Engine</dt>
                <dd>{project.engine}</dd>
              </>
            )}
            {project.release_date && (
              <>
                <dt>Release Date</dt>
                <dd>{formatDate(project.release_date)}</dd>
              </>
            )}
            {translation.playtime && (
              <>
                <dt>Playtime</dt>
                <dd>{translation.playtime}</dd>
              </>
            )}
            {project.project_type && (
              <>
                <dt>Type</dt>
                <dd>{project.project_type}</dd>
              </>
            )}
            {translation.rating_quote && (
              <>
                <dt>Rating</dt>
                <dd className="presskit-rating">"{translation.rating_quote}"</dd>
              </>
            )}
            {project.tags?.length > 0 && (
              <>
                <dt>Tags</dt>
                <dd className="presskit-tags-text">
                  {project.tags.map(tag => tag.tags_id).join(', ')}
                </dd>
              </>
            )}
          </dl>
        </section>

        {trailerEmbedUrl && (
          <section className="presskit-section">
            <h3>Trailer</h3>
            <div className="presskit-trailer">
              <iframe
                src={trailerEmbedUrl}
                frameBorder="0"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                title={`${title} trailer`}
              />
            </div>
          </section>
        )}

        {allScreenshots.length > 0 && (
          <section className="presskit-section">
            <h3>Screenshots</h3>
            <div className="presskit-screenshots">
              {allScreenshots.map((ss, i) => {
                if (ss.type === 'steam') {
                  return (
                    <img
                      key={i}
                      src={ss.url}
                      alt={`${title} screenshot ${i + 1}`}
                      className="presskit-screenshot"
                    />
                  );
                }
                return (
                  <SafeImage
                    key={i}
                    id={ss.id}
                    width={600}
                    quality={75}
                    alt={`${title} screenshot ${i + 1}`}
                    className="presskit-screenshot"
                  />
                );
              })}
            </div>
          </section>
        )}

        <section className="presskit-section">
          <h3>Links</h3>
          <div className="presskit-links">
            {project.steam_id && (
              <a href={`https://store.steampowered.com/app/${project.steam_id}/`} target="_blank" rel="noopener noreferrer" className="button-secondary button-steam">
                Steam
              </a>
            )}
            {project.github_url && (
              <a href={project.github_url} target="_blank" rel="noopener noreferrer" className="button-secondary button-github">
                Source Code
              </a>
            )}
            {project.web_version_url && (
              <a href={project.web_version_url} target="_blank" rel="noopener noreferrer" className="button-secondary button-web">
                Play Online
              </a>
            )}
            {project.google_play_url && (
              <a href={project.google_play_url} target="_blank" rel="noopener noreferrer" className="button-secondary button-googleplay">
                Google Play
              </a>
            )}
            {project.app_store_url && (
              <a href={project.app_store_url} target="_blank" rel="noopener noreferrer" className="button-secondary button-appstore">
                App Store
              </a>
            )}
          </div>
        </section>

        <section className="presskit-section presskit-about-dev">
          <h3>About the Developer</h3>
          <p>
            <strong>Null Comma</strong> is the solo game development portfolio of <strong>Christopher Ravailhe</strong>, a C# developer and Unity specialist.
            The portfolio showcases games, prototypes, and technical experiments built across multiple engines.
          </p>
          <p>
            Website: <a href="https://nullcomma.com" target="_blank" rel="noopener noreferrer">nullcomma.com</a>
          </p>
        </section>
      </div>
    </div>
  );
}

export default PressKitPage;
