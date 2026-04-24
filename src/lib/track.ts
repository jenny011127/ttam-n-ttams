import { supabase } from './supabase';

declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}

/**
 * 이벤트를 Supabase events 테이블 + GA4로 동시 기록
 * - Supabase: 어드민 대시보드·리드 관리용 (자체 DB)
 * - GA4: 광고 채널·UTM별 전환 분석용 (GTM 경유)
 *
 * GA4 전송은 window.dataLayer에 직접 푸시하는 방식.
 * gtag 전역보다 먼저 준비되므로, GTM이 늦게 로드돼도 큐에 쌓였다가 처리됨.
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

  // GA4 via dataLayer (gtag('event', ...) 와 동일 — dataLayer에 직접 푸시하면 GTM이 처리)
  if (typeof window !== 'undefined') {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(['event', eventType, data?.eventData || {}]);
  }
}
