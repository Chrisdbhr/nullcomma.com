import React, { useState, useEffect, useRef } from 'react';
import { baseURL } from '../utils';

const FADE_INTERVAL = 6000;
const CROSS_FADE = 1500;
const ZOOM_DURATION = 12000;
const ZOOM_MAX = 1.08;

function BackgroundSlideshow() {
  const [images, setImages] = useState([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [nextImg, setNextImg] = useState(null);
  const [fading, setFading] = useState(false);

  const urlA = useRef(null);
  const urlB = useRef(null);
  const zoomA = useRef(1);
  const zoomB = useRef(1);
  const activeRef = useRef(0);
  const orderRef = useRef([]);
  const indexRef = useRef(0);
  const rafRef = useRef(null);

  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  useEffect(() => {
    let cancelled = false;
    const fetchGameImages = async () => {
      try {
        const res = await fetch(
          `${baseURL}/items/projects?fields=card_image.id,card_image.type&filter[project_type][_eq]=game&filter[status][_eq]=published`
        );
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled) return;
        const urls = data.data.filter(p => p.card_image?.id).map(p => `${baseURL}/assets/${p.card_image.id}`);
        if (urls.length > 0) {
          setImages(urls);
          const order = shuffle([...urls]);
          orderRef.current = order;
          indexRef.current = 0;
          urlA.current = order[0];
          urlB.current = order[1];
          preload(order[2]);
          setActiveIdx(0);
        }
      } catch (_) {}
    };
    fetchGameImages();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (images.length === 0) return;
    let cancelled = false;
    let zoomStart = performance.now();
    let nextIn = null;

    function tick(now) {
      if (cancelled) return;
      const elapsed = now - zoomStart;
      const t = Math.min(elapsed / ZOOM_DURATION, 1);
      const scale = 1 + (ZOOM_MAX - 1) * t;

      if (activeRef.current === 0) zoomA.current = scale;
      else zoomB.current = scale;

      if (t >= 1) {
        zoomStart = performance.now();
      }

      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);

    const interval = setInterval(() => {
      const order = orderRef.current;
      const idx = indexRef.current;
      const nextIdx = (idx + 1) % order.length;
      const nextUrl = order[nextIdx];

      const currentlyActive = activeRef.current;

      if (currentlyActive === 0) {
        urlB.current = nextUrl;
        zoomB.current = 1;
        setNextImg(nextUrl);
      } else {
        urlA.current = nextUrl;
        zoomA.current = 1;
        setNextImg(nextUrl);
      }

      setFading(true);

      nextIn = setTimeout(() => {
        if (cancelled) return;
        const newActive = activeRef.current === 0 ? 1 : 0;
        activeRef.current = newActive;
        setActiveIdx(newActive);
        setFading(false);
        setNextImg(null);
        indexRef.current = nextIdx;
        const preloadIdx = (nextIdx + 1) % order.length;
        preload(order[preloadIdx]);
      }, CROSS_FADE);
    }, FADE_INTERVAL);

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafRef.current);
      clearInterval(interval);
      if (nextIn) clearTimeout(nextIn);
    };
  }, [images.length]);

  function preload(url) {
    if (!url) return;
    const img = new Image();
    img.src = url;
  }

  if (images.length === 0) return null;

  const showA = activeIdx === 0;
  const scaleA = zoomA.current;
  const scaleB = zoomB.current;

  return (
    <div className="bg-slideshow" aria-hidden="true">
      <div className="bg-slideshow-overlay" />

      <div
        className="bg-slide"
        style={{
          backgroundImage: `url(${urlA.current})`,
          transform: `scale(${scaleA})`,
          opacity: showA ? 1 : 0,
          transition: `opacity ${CROSS_FADE}ms ease-out`,
        }}
      />

      <div
        className="bg-slide"
        style={{
          backgroundImage: `url(${urlB.current})`,
          transform: `scale(${scaleB})`,
          opacity: showA ? 0 : 1,
          transition: `opacity ${CROSS_FADE}ms ease-out`,
        }}
      />
    </div>
  );
}

export default BackgroundSlideshow;
