import React, { useState, useEffect, useRef, useCallback } from 'react';
import { baseURL } from '../utils';

const SHOW_MS = 6000;
const FADE_MS = 1500;
const MAX_IMAGES = 15;
const LOAD_TIMEOUT = 3000;
const ZOOM_DURATION = 15000; // 15s from 1.0 to 1.08

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function BackgroundSlideshow() {
  const [current, setCurrent] = useState(null);
  const [entering, setEntering] = useState(null);
  const [fadePct, setFadePct] = useState(0);
  const order = useRef([]);
  const idx = useRef(0);
  const alive = useRef(true);
  const advanceTimer = useRef(null);
  const slideRefs = useRef({});

  // Per-slide zoom via JS rAF (tracks each URL's progress independently)
  useEffect(() => {
    const progress = {}; // url → current scale
    const RATE = 0.08 / (ZOOM_DURATION / 16.67); // per-frame increment at 60fps
    let raf;

    const tick = () => {
      Object.keys(slideRefs.current).forEach(url => {
        const el = slideRefs.current[url];
        if (!el) return;
        if (!(url in progress)) progress[url] = 1;
        progress[url] = Math.min(progress[url] + RATE, 1.08);
        el.style.transform = `scale(${progress[url]})`;
      });
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const setSlideRef = useCallback((url) => (el) => {
    slideRefs.current[url] = el;
  }, []);

  const scheduleNext = useCallback(() => {
    advanceTimer.current = setTimeout(() => {
      if (!alive.current) return;
      const o = order.current;
      const nextIdx = (idx.current + 1) % o.length;
      idx.current = nextIdx;
      const nextUrl = o[nextIdx];

      const img = new Image();
      let done = false;
      const begin = () => {
        if (done || !alive.current) return;
        done = true;
        setFadePct(0);
        setEntering(nextUrl);
      };
      img.onload = begin;
      img.onerror = begin;
      img.src = nextUrl;
      setTimeout(begin, LOAD_TIMEOUT);
    }, SHOW_MS);
  }, []);

  useEffect(() => {
    if (!entering) return;
    const start = Date.now();
    let raf;

    const animate = () => {
      const elapsed = Date.now() - start;
      const pct = Math.min(elapsed / FADE_MS, 1);
      setFadePct(pct);
      if (pct >= 1) {
        setCurrent(entering);
        setEntering(null);
        scheduleNext();
      } else {
        raf = requestAnimationFrame(animate);
      }
    };

    raf = requestAnimationFrame(animate);
    return () => {
      if (raf) cancelAnimationFrame(raf);
    };
  }, [entering, scheduleNext]);

  useEffect(() => {
    fetch(`${baseURL}/items/projects?fields=card_image.id,steam_screenshots,screenshots.directus_files_id.id&filter[project_type][_eq]=game&filter[status][_eq]=published`)
      .then(r => r.json())
      .then(data => {
        if (!alive.current) return;
        const gameGroups = [];
        data.data.forEach(p => {
          const group = [];
          if (p.card_image?.id) group.push(`${baseURL}/assets/${p.card_image.id}`);
          if (p.steam_screenshots?.length > 0) {
            p.steam_screenshots.forEach(ss => {
              const url = typeof ss === 'string' ? ss : (ss.path || ss.url);
              if (url) group.push(url);
            });
          }
          if (p.screenshots?.length > 0) {
            p.screenshots.forEach(ss => {
              const id = ss.directus_files_id?.id;
              if (id) group.push(`${baseURL}/assets/${id}`);
            });
          }
          if (group.length > 0) gameGroups.push(shuffle(group));
        });
        if (gameGroups.length === 0) return;

        const interleaved = [];
        const maxLen = Math.max(...gameGroups.map(g => g.length));
        for (let i = 0; i < maxLen; i++) {
          for (let g = 0; g < gameGroups.length; g++) {
            if (i < gameGroups[g].length) interleaved.push(gameGroups[g][i]);
          }
        }
        const limited = interleaved.slice(0, MAX_IMAGES);
        order.current = limited;
        limited.forEach(u => { const i = new Image(); i.src = u; });
        idx.current = 0;
        setCurrent(order.current[0]);
        scheduleNext();
      })
      .catch(() => {});
    return () => { alive.current = false; };
  }, [scheduleNext]);

  useEffect(() => {
    return () => { if (advanceTimer.current) clearTimeout(advanceTimer.current); };
  }, []);

  return (
    <div className="bg-slideshow" aria-hidden="true">
      <div className="bg-slideshow-overlay" />
      {current && (
        <div
          className="bg-slide"
          key={current}
          ref={setSlideRef(current)}
          style={{
            backgroundImage: `url(${current})`,
            opacity: 1,
          }}
        />
      )}
      {entering && (
        <div
          className="bg-slide"
          key={entering}
          ref={setSlideRef(entering)}
          style={{
            backgroundImage: `url(${entering})`,
            opacity: fadePct,
          }}
        />
      )}
    </div>
  );
}

export default BackgroundSlideshow;
