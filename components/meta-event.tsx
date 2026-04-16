'use client';

import { useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

export default function MetaEvent({ eventName }: { eventName: string }) {
  const searchParams = useSearchParams();
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    const sessionId = searchParams.get('session_id');
    const amount = searchParams.get('amount');
    if (!sessionId || !window.fbq) return;

    const params: Record<string, unknown> = { currency: 'USD' };
    if (amount) params.value = parseFloat(amount);

    window.fbq('trackCustom', eventName, params, { eventID: sessionId });
    fired.current = true;
  }, [searchParams, eventName]);

  return null;
}
