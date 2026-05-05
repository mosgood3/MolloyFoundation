export type MetaClientContext = {
  fbp: string | null;
  fbc: string | null;
  user_agent: string | null;
};

export function getMetaClientContext(): MetaClientContext {
  if (typeof document === 'undefined') {
    return { fbp: null, fbc: null, user_agent: null };
  }

  const fbpMatch = document.cookie.match(/(?:^|; )_fbp=([^;]+)/);
  const fbp = fbpMatch ? decodeURIComponent(fbpMatch[1]) : null;

  const fbcMatch = document.cookie.match(/(?:^|; )_fbc=([^;]+)/);
  let fbc = fbcMatch ? decodeURIComponent(fbcMatch[1]) : null;
  if (!fbc && typeof window !== 'undefined') {
    const fbclid = new URLSearchParams(window.location.search).get('fbclid');
    if (fbclid) fbc = `fb.1.${Date.now()}.${fbclid}`;
  }

  const user_agent = typeof navigator !== 'undefined' ? navigator.userAgent : null;

  return { fbp, fbc, user_agent };
}
