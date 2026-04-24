import { supabase } from './supabase';

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * GA4로 이벤트 전송. gtag가 아직 로드 전이면 최대 5초까지 폴링하며 재시도.
 * window.location.search에 debug=1 있으면 콘솔 로그로 상태 출력.
 */
function sendToGA4(eventType: string, eventData?: Record<string, unknown>) {
  if (typeof window === 'undefined') return;

  const debug = window.location.search.includes('debug=1');

  const send = (): boolean => {
    if (typeof window.gtag === 'function') {
      window.gtag('event', eventType, eventData || {});
      if (debug) console.log('[trackEvent→GA4] sent', eventType, eventData);
      return true;
    }
    return false;
  };

  if (send()) return;

  if (debug) {
    console.warn('[trackEvent→GA4] gtag not ready, polling...', eventType, {
      dataLayerLen: window.dataLayer?.length,
      gtagType: typeof window.gtag,
    });
  }

  let retries = 0;
  const interval = setInterval(() => {
    if (send() || ++retries >= 50) {
      if (retries >= 50 && debug) {
        console.error('[trackEvent→GA4] gtag never loaded after 5s, event lost:', eventType);
      }
      clearInterval(interval);
    }
  }, 100);
}

/**
 * 이벤트를 Supabase + GA4로 동시 기록.
 */
export function trackEvent(
  eventType: string,
  data?: {
    page?: string;
    eventData?: Record<string, unknown>;
  }
) {
  const params = typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search)
    : null;
  const page = data?.page || (typeof window !== 'undefined' ? window.location.pathname : null);

  // Supabase
  if (supabase) {
    supabase.from('events').insert({
      event_type: eventType,
      event_data: data?.eventData || {},
      page,
      utm_source: params?.get('utm_source') || null,
      utm_medium: params?.get('utm_medium') || null,
      utm_campaign: params?.get('utm_campaign') || null,
    }).then(); // fire-and-forget
  }

  // GA4
  sendToGA4(eventType, data?.eventData);
}
