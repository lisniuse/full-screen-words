/**
 * 本次会话已经 POST 过 /practice/learned/:word 的单词集合。
 * 仅用于跳过重复 markLearned 请求，与"已学/已掌握"无关——后者由 learnedStore 维护。
 * 登出时由 auth store 调 clear() 清掉，避免跨账号污染下个用户的统计。
 */
const cache = new Set<string>();

export const hasMarkedThisSession = (word: string): boolean => cache.has(word);
export const addMarkedThisSession = (word: string): void => {
  cache.add(word);
};
export const clearMarkedThisSession = (): void => {
  cache.clear();
};
