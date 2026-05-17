import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { baseURL, fieldsQuery, formatDate } from '../utils';
import JSZip from 'jszip';
import SafeImage from '../components/SafeImage';
import { getPreferredTranslation } from '../utils/translationUtils';

async function fetchBlob(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return await res.blob();
  } catch {
    return null;
  }
}

const pressContact = {
  name: 'Christopher Ravailhe',
  email: 'contato@nullcomma.com',
  website: 'https://nullcomma.com',
};

const brandColors = [
  { name: 'Background', hex: '#141414' },
  { name: 'Cards', hex: '#1F1F1F' },
  { name: 'Purple Accent', hex: '#764FA2' },
  { name: 'Green (CTA)', hex: '#65CC9A' },
  { name: 'Text', hex: '#FFFFFF' },
  { name: 'Secondary Text', hex: '#A0A0A0' },
];

function PressKitPage() {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [zipping, setZipping] = useState(false);
  const [lang, setLang] = useState(() => {
    const saved = localStorage.getItem('presskit-lang');
    if (saved === 'pt' || saved === 'en') return saved;
    return navigator.language.startsWith('pt') ? 'pt' : 'en';
  });
  const [copied, setCopied] = useState(false);
  const [embedCopied, setEmbedCopied] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem('presskit-lang', lang);
  }, [lang]);

  useEffect(() => {
    if (!projectId) return;
    const fetchProject = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${baseURL}/items/projects/${projectId}?${fieldsQuery}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        setProject(data.data);
      } catch (error) {
        console.error('Error fetching project:', error);
        setError(error.message);
        setProject(null);
      }
      setLoading(false);
    };
    fetchProject();
  }, [projectId]);

  const translation = project ? getPreferredTranslation(project.translations, lang) : {};
  const title = translation.title || 'Title Not Available';

  const shortDesc = translation.synopsis
    ? translation.synopsis.split('\n')[0].replace(/^(#+\s*)/, '').replace(/([*_~]|\[.*?\]\(.*?\))/g, '').trim().substring(0, 200)
    : '';

  const fullDesc = translation.synopsis || '';

  const handleCopyDescription = async () => {
    const text = `${title}\n\n${shortDesc}${fullDesc !== shortDesc ? '\n\n' + fullDesc : ''}\n\nLinks:\n${project.steam_id ? `Steam: https://store.steampowered.com/app/${project.steam_id}/` : ''}${project.github_url ? `\nSource: ${project.github_url}` : ''}${project.web_version_url ? `\nWeb: ${project.web_version_url}` : ''}\n\nPress Kit: ${window.location.href}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopyEmbed = async () => {
    const embed = `<iframe src="${window.location.href}" width="100%" height="600" frameborder="0" title="${title} Press Kit"></iframe>`;
    try {
      await navigator.clipboard.writeText(embed);
      setEmbedCopied(true);
      setTimeout(() => setEmbedCopied(false), 2000);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = embed;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setEmbedCopied(true);
      setTimeout(() => setEmbedCopied(false), 2000);
    }
  };

  const handleDownloadZip = async () => {
    if (!project) return;
    setZipping(true);
    const zip = new JSZip();
    const safeTitle = title.replace(/[^a-z0-9]/gi, '_').toLowerCase();

    const folder = zip.folder(`${safeTitle}_presskit`);
    folder.file('info.txt', [
      `Title: ${title}`,
      `Engine: ${project.engine || 'N/A'}`,
      `Release Date: ${project.release_date ? formatDate(project.release_date) : 'TBA'}`,
      translation.playtime ? `Playtime: ${translation.playtime}` : '',
      `Tags: ${project.tags?.map(t => t.tags_id).join(', ') || 'N/A'}`,
      '',
      'Synopsis:',
      fullDesc || 'N/A',
      '',
      'Links:',
      project.steam_id ? `Steam: https://store.steampowered.com/app/${project.steam_id}/` : '',
      project.github_url ? `Source: ${project.github_url}` : '',
      project.web_version_url ? `Web: ${project.web_version_url}` : '',
      project.google_play_url ? `Google Play: ${project.google_play_url}` : '',
      project.app_store_url ? `App Store: ${project.app_store_url}` : '',
      project.trailer_url ? `Trailer: ${project.trailer_url}` : '',
      '',
      'Press Contact:',
      `${pressContact.name}`,
      `${pressContact.email}`,
      `${pressContact.website}`,
    ].filter(Boolean).join('\n'));

    folder.file('brand-colors.txt', brandColors.map(c => `${c.name}: ${c.hex}`).join('\n'));

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
        const url = typeof ss === 'string' ? ss : (ss.path || ss.url);
        if (url) zipScreenshots.push({ url });
      });
    }
    if (project.screenshots?.length > 0) {
      project.screenshots.forEach((ss) => {
        const fileId = ss.directus_files_id?.id;
        if (fileId) zipScreenshots.push({ url: `${baseURL}/assets/${fileId}` });
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

  if (error) {
    return (
      <div className="page-content fade-in">
        <h2>Error Loading Press Kit</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className="button-primary">Retry</button>
        <Link to="/" className="button-secondary" style={{ marginLeft: '10px' }}>&larr; Go Home</Link>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="page-content fade-in">
        <h2>Project Not Found</h2>
        <Link to="/" className="button-primary">&larr; Go back to Home</Link>
      </div>
    );
  }

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
      const url = typeof ss === 'string' ? ss : (ss.path || ss.url);
      if (url) allScreenshots.push({ type: 'steam', url });
    });
  }
  if (project.screenshots?.length > 0) {
    project.screenshots.forEach((ss) => {
      const fileId = ss.directus_files_id?.id;
      if (fileId) allScreenshots.push({ type: 'directus', id: fileId });
    });
  }

  const ogImageUrl = cardImageId ? `${baseURL}/assets/${cardImageId}?width=1200&quality=80` : null;

  return (
    <div className="page-content fade-in presskit-page">
      <title>{`${title} — Press Kit | Null Comma`}</title>
      <meta name="description" content={`Press kit for ${title}. Download logos, screenshots, and project info.`} />
      <meta property="og:title" content={`${title} — Press Kit`} />
      <meta property="og:description" content={shortDesc} />
      <meta property="og:type" content="article" />
      {ogImageUrl && <meta property="og:image" content={ogImageUrl} />}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={`${title} — Press Kit`} />
      <meta name="twitter:description" content={shortDesc} />
      {ogImageUrl && <meta name="twitter:image" content={ogImageUrl} />}

      <div className="presskit-top-bar">
        <button onClick={() => navigate(-1)} className="button-back">&larr; Back</button>
        <div className="presskit-lang-toggle">
          <button className={lang === 'en' ? 'active' : ''} onClick={() => setLang('en')}>EN</button>
          <button className={lang === 'pt' ? 'active' : ''} onClick={() => setLang('pt')}>PT</button>
        </div>
      </div>

      <div className="presskit-header">
        <div>
          <h2 className="presskit-title">{title}</h2>
          <p className="presskit-subtitle">Press Kit</p>
        </div>
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

      <div className="presskit-layout">
        <div className="presskit-main">
          <section className="presskit-section">
            <div className="presskit-section-header">
              <h3>{lang === 'pt' ? 'Sobre' : 'About'}</h3>
              <button className="button-copy-desc" onClick={handleCopyDescription}>
                {copied ? (lang === 'pt' ? 'Copiado!' : 'Copied!') : (lang === 'pt' ? 'Copiar descrição' : 'Copy description')}
              </button>
            </div>
            <div className="presskit-copy-box">
              <p>{shortDesc}</p>
              {fullDesc !== shortDesc && <p>{fullDesc}</p>}
            </div>
          </section>

          {trailerEmbedUrl && (
            <section className="presskit-section">
              <h3>{lang === 'pt' ? 'Trailer' : 'Trailer'}</h3>
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
              <h3>{lang === 'pt' ? 'Screenshots' : 'Screenshots'}</h3>
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
            <h3>{lang === 'pt' ? 'Links' : 'Links'}</h3>
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

          <section className="presskit-section">
            <h3>{lang === 'pt' ? 'Embed This Press Kit' : 'Embed This Press Kit'}</h3>
            <div className="presskit-embed-box">
              <p className="embed-desc">{lang === 'pt' ? 'Cole este código no seu site para embeddar o press kit:' : 'Paste this code on your site to embed the press kit:'}</p>
              <code>{`<iframe src="${window.location.href}" width="100%" height="600" frameborder="0" title="${title} Press Kit"></iframe>`}</code>
              <button className="button-copy-embed" onClick={handleCopyEmbed}>
                {embedCopied ? (lang === 'pt' ? 'Copiado!' : 'Copied!') : (lang === 'pt' ? 'Copiar código' : 'Copy code')}
              </button>
            </div>
          </section>
        </div>

        <aside className="presskit-sidebar">
          <div className="presskit-sidebar-box">
            <h4>{lang === 'pt' ? 'Fatos Rápidos' : 'Quick Facts'}</h4>
            <dl className="presskit-facts">
              {project.engine && (
                <>
                  <dt>{lang === 'pt' ? 'Engine' : 'Engine'}</dt>
                  <dd>{project.engine}</dd>
                </>
              )}
              {project.release_date && (
                <>
                  <dt>{lang === 'pt' ? 'Lançamento' : 'Release'}</dt>
                  <dd>{formatDate(project.release_date)}</dd>
                </>
              )}
              {translation.playtime && (
                <>
                  <dt>{lang === 'pt' ? 'Duração' : 'Playtime'}</dt>
                  <dd>{translation.playtime}</dd>
                </>
              )}
              {project.project_type && (
                <>
                  <dt>{lang === 'pt' ? 'Tipo' : 'Type'}</dt>
                  <dd>{project.project_type}</dd>
                </>
              )}
              {translation.rating_quote && (
                <>
                  <dt>{lang === 'pt' ? 'Avaliação' : 'Rating'}</dt>
                  <dd className="presskit-rating">"{translation.rating_quote}"</dd>
                </>
              )}
              {project.tags?.length > 0 && (
                <>
                  <dt>{lang === 'pt' ? 'Tags' : 'Tags'}</dt>
                  <dd className="presskit-tags-text">
                    {project.tags.map(tag => tag.tags_id).join(', ')}
                  </dd>
                </>
              )}
            </dl>
          </div>

          <div className="presskit-sidebar-box">
            <h4>{lang === 'pt' ? 'Contato Imprensa' : 'Press Contact'}</h4>
            <div className="presskit-contact">
              <p><strong>{pressContact.name}</strong></p>
              <p><a href={`mailto:${pressContact.email}`}>{pressContact.email}</a></p>
              <p><a href={pressContact.website} target="_blank" rel="noopener noreferrer">{pressContact.website}</a></p>
            </div>
          </div>

          <div className="presskit-sidebar-box">
            <h4>{lang === 'pt' ? 'Cores da Marca' : 'Brand Colors'}</h4>
            <div className="presskit-colors">
              {brandColors.map(c => (
                <div key={c.hex} className="color-swatch">
                  <div className="color-preview" style={{ backgroundColor: c.hex, border: c.hex === '#141414' || c.hex === '#1F1F1F' ? '1px solid #333' : 'none' }} />
                  <span className="color-name">{c.name}</span>
                  <span className="color-hex">{c.hex}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="presskit-sidebar-box">
            <h4>{lang === 'pt' ? 'Sobre o Desenvolvedor' : 'About the Developer'}</h4>
            <p className="presskit-about-dev">
              <strong>Null Comma</strong> is the solo game development portfolio of <strong>Christopher Ravailhe</strong>, a C# developer and Unity specialist.
              The portfolio showcases games, prototypes, and technical experiments built across multiple engines.
            </p>
            <p><a href="https://nullcomma.com" target="_blank" rel="noopener noreferrer">nullcomma.com</a></p>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default PressKitPage;
