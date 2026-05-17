import React, { useState, useEffect, useRef, useCallback } from 'react';
import { baseURL } from '../utils';

const SHOW_MS = 6000;
const FADE_MS = 1500;
const MAX_IMAGES = 15;

function BackgroundSlideshow() {
  const [items, setItems] = useState([null, null]); // [current, fading] or [current, null]
  const order = useRef([]);
  const idx = useRef(0);
  const timer = useRef(null);
  const alive = useRef(true);
  const itemsRef = useRef([null, null]);
  const zoomRef = useRef(1);
  const zoomDir = useRef(1);
  const slideContainer = useRef(null);

  function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  const advance = useCallback(() => {
    if (!alive.current) return;
    const o = order.current;
    const nextIdx = (idx.current + 1) % o.length;
    idx.current = nextIdx;

    const cur = itemsRef.current;
    const nextUrl = o[nextIdx];

    setItems([cur[0], nextUrl]);

    setTimeout(() => {
      if (!alive.current) return;
      itemsRef.current = [nextUrl, null];
      setItems([nextUrl, null]);
    }, FADE_MS);

  }, []);

  useEffect(() => {
    fetch(`${baseURL}/items/projects?fields=card_image.id,steam_screenshots,screenshots.directus_files_id.id&filter[project_type][_eq]=game&filter[status][_eq]=published`)
      .then(r => r.json())
      .then(data => {
        if (!alive.current) return;
        const allUrls = [];

        data.data.forEach(p => {
          if (p.card_image?.id) allUrls.push(`${baseURL}/assets/${p.card_image.id}`);

          if (p.steam_screenshots?.length > 0) {
            p.steam_screenshots.forEach(ss => {
              const url = typeof ss === 'string' ? ss : (ss.path || ss.url);
              if (url) allUrls.push(url);
            });
          }

          if (p.screenshots?.length > 0) {
            p.screenshots.forEach(ss => {
              const id = ss.directus_files_id?.id;
              if (id) allUrls.push(`${baseURL}/assets/${id}`);
            });
          }
        });

        if (allUrls.length < 2) return;
        const limitedUrls = allUrls.slice(0, MAX_IMAGES);
        order.current = shuffle([...limitedUrls]);
        limitedUrls.forEach(u => { const i = new Image(); i.src = u; });
        idx.current = 0;
        const first = order.current[0];
        itemsRef.current = [first, null];
        setItems([first, null]);
      })
      .catch(() => {});
    return () => { alive.current = false; };
  }, []);

  useEffect(() => {
    if (!items[0]) return;
    timer.current = setInterval(advance, SHOW_MS);
    return () => clearInterval(timer.current);
  }, [items[0], advance]);

  // JS-driven smooth zoom animation
  useEffect(() => {
    let rafId;
    const ZOOM_SPEED = 0.0003;
    const ZOOM_MIN = 1;
    const ZOOM_MAX = 1.08;

    const animateZoom = () => {
      zoomRef.current += ZOOM_SPEED * zoomDir.current;
      if (zoomRef.current >= ZOOM_MAX) {
        zoomRef.current = ZOOM_MAX;
        zoomDir.current = -1;
      } else if (zoomRef.current <= ZOOM_MIN) {
        zoomRef.current = ZOOM_MIN;
        zoomDir.current = 1;
      }
      if (slideContainer.current) {
        const slides = slideContainer.current.querySelectorAll('.bg-slide');
        slides.forEach(slide => {
          slide.style.transform = `scale(${zoomRef.current})`;
        });
      }
      rafId = requestAnimationFrame(animateZoom);
    };

    rafId = requestAnimationFrame(animateZoom);
    return () => cancelAnimationFrame(rafId);
  }, []);

  const [current, fading] = items;

  return (
    <div className="bg-slideshow" aria-hidden="true" ref={slideContainer}>
      <div className="bg-slideshow-overlay" />
      {current != null && (
        <div className="bg-slide visible" key={current} style={{ backgroundImage: `url(${current})` }} />
      )}
      {fading != null && (
        <div className="bg-slide show" key={fading} style={{ backgroundImage: `url(${fading})` }} />
      )}
    </div>
  );
}

export default BackgroundSlideshow;
