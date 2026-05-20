/**
 * 本次会话已通知后端"打开过"的单词集合。
 * WordModal 打开时若命中则跳过 /practice/learned 请求（后端依然幂等，但省一次往返）。
 * 登出时通过 clearLearnedCache() 清空，避免跨账号污染。
 */
const cache = new Set<string>();

export function hasLearned(word: string): boolean {
  return cache.has(word);
}

export function markLearned(word: string): void {
  cache.add(word);
}

export function clearLearnedCache(): void {
  cache.clear();
}
