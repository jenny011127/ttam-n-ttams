import { supabase } from './supabase';

/**
 * 이벤트를 Supabase events 테이블에 기록
 */
export function trackEvent(
  eventType: string,
  data?: {
    page?: string;
    eventData?: Record<string, unknown>;
  }
) {
  if (!supabase) return;

  // URL에서 UTM 파라미터 추출
  const params = typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search)
    : null;

  supabase.from('events').insert({
    event_type: eventType,
    event_data: data?.eventData || {},
    page: data?.page || (typeof window !== 'undefined' ? window.location.pathname : null),
    utm_source: params?.get('utm_source') || null,
    utm_medium: params?.get('utm_medium') || null,
    utm_campaign: params?.get('utm_campaign') || null,
  }).then(); // fire-and-forget
}
