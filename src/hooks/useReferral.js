import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

const REFERRALS = {
  chrisjogos: {
    title: 'Null Comma (ChrisJogos.com)',
    subtitle: "'ChrisJogos.com' agora é 'Null Comma'",
  },
};

export function useReferral() {
  const [searchParams] = useSearchParams();
  const ref = searchParams.get('ref');

  useEffect(() => {
    if (ref && REFERRALS[ref]) {
      try {
        sessionStorage.setItem('ref', ref);
      } catch {}
    }
  }, [ref]);

  if (ref && REFERRALS[ref]) {
    return REFERRALS[ref];
  }

  try {
    const storedRef = sessionStorage.getItem('ref');
    if (storedRef && REFERRALS[storedRef]) {
      return REFERRALS[storedRef];
    }
  } catch {}

  return null;
}
