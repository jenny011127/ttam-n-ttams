/**
 * 개인정보 마스킹 유틸
 */

/**
 * 이름 마스킹: 성만 노출, 나머지는 **
 * - '정준호' → '정**'
 * - '김민' → '김**'
 * - '정**' → '정**' (이미 마스킹된 경우 그대로)
 * - '김민지**' → '김**' (기존 별표 제거 후 재마스킹)
 */
export function maskName(name: string): string {
  if (!name) return '';
  const first = name.charAt(0);
  return `${first}**`;
}
