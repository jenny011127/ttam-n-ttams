import { supabase } from './supabase';

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

/**
 * GTM dataLayer로 이벤트 푸시. GTM의 맞춤 이벤트 트리거가 이걸 받아 GA4로 전달.
 * (gtag가 아니라 dataLayer 사용 — GTM 경유 환경에서 gtag는 window에 노출되지 않음)
 */
function pushToDataLayer(eventType: string, eventData?: Record<string, unknown>) {
  if (typeof window === 'undefined') return;

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: eventType, ...(eventData || {}) });

  if (window.location.search.includes('debug=1')) {
    console.log('[trackEvent→GTM]', eventType, eventData);
  }
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

  // GA4 (via GTM)
  pushToDataLayer(eventType, data?.eventData);
}
