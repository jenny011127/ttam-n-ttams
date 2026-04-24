import { supabase } from './supabase';

declare global {
  interface Window {
    gtag?: (
      command: 'event',
      eventName: string,
      params?: Record<string, unknown>
    ) => void;
  }
}

/**
 * 이벤트를 Supabase events 테이블 + GA4로 동시 기록
 * - Supabase: 어드민 대시보드·리드 관리용 (자체 DB)
 * - GA4: 광고 채널·UTM별 전환 분석용 (GTM 경유 Google 태그가 전송)
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

  // GA4 — GTM이 로드한 Google 태그의 gtag 전역 사용
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', eventType, data?.eventData || {});
  }
}
