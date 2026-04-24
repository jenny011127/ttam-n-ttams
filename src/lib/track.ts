import { supabase } from './supabase';

declare global {
  interface Window {
    dataLayer?: IArguments[] | unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * 이벤트를 Supabase + GA4(via GTM Google Tag) 에 기록.
 *
 * GA4 전송은 gtag 전역 함수를 사용.
 * - window.gtag가 없으면 직접 shim을 생성해 dataLayer에 arguments를 푸시 (gtag.js canonical pattern)
 * - 이렇게 하면 GTM이 늦게 로드돼도 gtag.js가 dataLayer를 처리하면서 이벤트가 GA4로 전송됨
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

  // GA4 via gtag (canonical pattern — arguments 객체 사용)
  if (typeof window !== 'undefined') {
    window.dataLayer = window.dataLayer || [];
    if (typeof window.gtag !== 'function') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      window.gtag = function gtag() {
        // eslint-disable-next-line prefer-rest-params
        (window.dataLayer as IArguments[]).push(arguments);
      };
    }
    window.gtag('event', eventType, data?.eventData || {});
  }
}
