import React, { useState, useEffect, useRef } from 'react';
import { baseURL } from '../utils';

const FADE_INTERVAL = 6000;
const CROSS_FADE_DURATION = 1500;

function BackgroundSlideshow() {
  const [images, setImages] = useState([]);
  const [current, setCurrent] = useState(null);
  const [next, setNext] = useState(null);
  const [fading, setFading] = useState(false);
  const orderRef = useRef([]);
  const indexRef = useRef(0);

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

        const urls = data.data
          .filter(p => p.card_image?.id)
          .map(p => `${baseURL}/assets/${p.card_image.id}?width=1600&quality=60`);

        if (urls.length > 0) {
          setImages(urls);
          orderRef.current = shuffle([...urls]);
          startSlide(urls);
        }
      } catch (e) {
        // silent
      }
    };

    fetchGameImages();
    return () => { cancelled = true; };
  }, []);

  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function startSlide(urls) {
    const order = shuffle([...urls]);
    orderRef.current = order;
    indexRef.current = 0;
    setCurrent(order[0]);
    preloadImage(order[1]);

    const timer = setInterval(() => {
      const idx = indexRef.current;
      const nextIdx = (idx + 1) % order.length;
      const nextUrl = order[nextIdx];

      setNext(nextUrl);
      setFading(true);

      setTimeout(() => {
        setCurrent(nextUrl);
        setNext(null);
        setFading(false);
        indexRef.current = nextIdx;

        const preloadIdx = (nextIdx + 1) % order.length;
        preloadImage(order[preloadIdx]);
      }, CROSS_FADE_DURATION);
    }, FADE_INTERVAL);

    return () => clearInterval(timer);
  }

  function preloadImage(url) {
    if (!url) return;
    const img = new Image();
    img.src = url;
  }

  if (images.length === 0) return null;

  return (
    <div className="bg-slideshow" aria-hidden="true">
      <div className="bg-slideshow-overlay" />

      <div
        className="bg-slide"
        style={{
          backgroundImage: `url(${current})`,
          opacity: 1,
        }}
      />

      {fading && next && (
        <div
          className="bg-slide bg-slide-next"
          style={{
            backgroundImage: `url(${next})`,
            animation: `bgCrossFade ${CROSS_FADE_DURATION}ms ease-out forwards`,
          }}
        />
      )}
    </div>
  );
}

export default BackgroundSlideshow;
