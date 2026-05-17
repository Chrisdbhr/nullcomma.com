import React, { useState, useEffect, useRef, useCallback } from 'react';
import { baseURL } from '../utils';

const SHOW_MS = 6000;
const FADE_MS = 1500;

function BackgroundSlideshow() {
  const [items, setItems] = useState([null, null]); // [current, fading] or [current, null]
  const order = useRef([]);
  const idx = useRef(0);
  const timer = useRef(null);
  const alive = useRef(true);
  const itemsRef = useRef([null, null]);

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
    fetch(`${baseURL}/items/projects?fields=card_image.id&filter[project_type][_eq]=game&filter[status][_eq]=published`)
      .then(r => r.json())
      .then(data => {
        if (!alive.current) return;
        const imgs = data.data.filter(p => p.card_image?.id).map(p => `${baseURL}/assets/${p.card_image.id}`);
        if (imgs.length < 2) return;
        order.current = shuffle([...imgs]);
        imgs.forEach(u => { const i = new Image(); i.src = u; });
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

  const [current, fading] = items;

  return (
    <div className="bg-slideshow" aria-hidden="true">
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
