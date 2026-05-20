import React from 'react';

interface Props {
  code: string;
  size?: number;
  /** 未解锁时显示为灰度 + 降低透明度 */
  unlocked?: boolean;
}

interface Visual {
  /** 渐变起止色，用于背景柔光 */
  from: string;
  to: string;
  render: (id: string) => React.ReactNode;
}

const VISUALS: Record<string, Visual> = {
  // 🌱 词汇启蒙之初
  first_word: {
    from: '#bbf7d0',
    to: '#16a34a',
    render: (id) => (
      <g>
        <path
          d="M 24 36 L 24 22"
          stroke="#15803d"
          strokeWidth={2}
          strokeLinecap="round"
        />
        <path
          d="M 24 24 C 16 24 14 18 14 12 C 20 12 24 16 24 24 Z"
          fill={`url(#${id}-l1)`}
        />
        <path
          d="M 24 22 C 32 22 34 16 34 11 C 28 11 24 14 24 22 Z"
          fill={`url(#${id}-l2)`}
        />
        <defs>
          <linearGradient id={`${id}-l1`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#4ade80" />
            <stop offset="1" stopColor="#15803d" />
          </linearGradient>
          <linearGradient id={`${id}-l2`} x1="1" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#86efac" />
            <stop offset="1" stopColor="#22c55e" />
          </linearGradient>
        </defs>
      </g>
    ),
  },
  // 📖 单本书
  words_10: {
    from: '#bfdbfe',
    to: '#1d4ed8',
    render: (id) => (
      <g>
        <rect x="13" y="14" width="22" height="20" rx="2.5" fill={`url(#${id}-c)`} />
        <line x1="24" y1="14" x2="24" y2="34" stroke="#1e3a8a" strokeWidth={1.2} />
        <line x1="17" y1="20" x2="22" y2="20" stroke="white" strokeWidth={1.2} strokeLinecap="round" />
        <line x1="17" y1="24" x2="22" y2="24" stroke="white" strokeWidth={1.2} strokeLinecap="round" />
        <line x1="26" y1="20" x2="31" y2="20" stroke="white" strokeWidth={1.2} strokeLinecap="round" />
        <line x1="26" y1="24" x2="31" y2="24" stroke="white" strokeWidth={1.2} strokeLinecap="round" />
        <defs>
          <linearGradient id={`${id}-c`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#60a5fa" />
            <stop offset="1" stopColor="#1d4ed8" />
          </linearGradient>
        </defs>
      </g>
    ),
  },
  // 📚 一摞书
  words_50: {
    from: '#a5f3fc',
    to: '#0e7490',
    render: (id) => (
      <g>
        <rect x="12" y="28" width="24" height="6" rx="1.5" fill={`url(#${id}-b)`} />
        <rect x="14" y="22" width="20" height="6" rx="1.5" fill={`url(#${id}-m)`} />
        <rect x="16" y="16" width="16" height="6" rx="1.5" fill={`url(#${id}-t)`} />
        <line x1="18" y1="19" x2="22" y2="19" stroke="white" strokeWidth={1} strokeLinecap="round" />
        <line x1="16" y1="25" x2="22" y2="25" stroke="white" strokeWidth={1} strokeLinecap="round" />
        <line x1="14" y1="31" x2="22" y2="31" stroke="white" strokeWidth={1} strokeLinecap="round" />
        <defs>
          <linearGradient id={`${id}-b`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#22d3ee" />
            <stop offset="1" stopColor="#0e7490" />
          </linearGradient>
          <linearGradient id={`${id}-m`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#06b6d4" />
            <stop offset="1" stopColor="#0891b2" />
          </linearGradient>
          <linearGradient id={`${id}-t`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#67e8f9" />
            <stop offset="1" stopColor="#0e7490" />
          </linearGradient>
        </defs>
      </g>
    ),
  },
  // 🎓 学士帽
  words_100: {
    from: '#e9d5ff',
    to: '#7e22ce',
    render: (id) => (
      <g>
        <polygon points="24,12 38,18 24,24 10,18" fill={`url(#${id}-c)`} />
        <path d="M 14 20 L 14 26 Q 14 32, 24 32 Q 34 32, 34 26 L 34 20" fill={`url(#${id}-b)`} />
        <line x1="38" y1="18" x2="38" y2="30" stroke="#7e22ce" strokeWidth={1.4} strokeLinecap="round" />
        <circle cx="38" cy="32" r="2" fill="#facc15" />
        <defs>
          <linearGradient id={`${id}-c`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#c084fc" />
            <stop offset="1" stopColor="#6b21a8" />
          </linearGradient>
          <linearGradient id={`${id}-b`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#a855f7" />
            <stop offset="1" stopColor="#581c87" />
          </linearGradient>
        </defs>
      </g>
    ),
  },
  // 🔥 小火苗
  combo_5: {
    from: '#fed7aa',
    to: '#c2410c',
    render: (id) => (
      <g>
        <path
          d="M 24 12 C 30 18 32 22 32 27 C 32 32 28 36 24 36 C 20 36 16 32 16 27 C 16 24 18 22 20 24 C 19 19 22 16 24 12 Z"
          fill={`url(#${id}-f)`}
        />
        <path
          d="M 24 22 C 26 24 27 26 27 28 C 27 30 26 32 24 32 C 22 32 21 30 21 28 C 21 26 23 24 24 22 Z"
          fill="#fde68a"
        />
        <defs>
          <linearGradient id={`${id}-f`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fb923c" />
            <stop offset="1" stopColor="#b91c1c" />
          </linearGradient>
        </defs>
      </g>
    ),
  },
  // ⚡ 闪电
  combo_20: {
    from: '#fef08a',
    to: '#ca8a04',
    render: (id) => (
      <g>
        <polygon
          points="26,10 14,28 22,28 18,38 34,20 26,20 30,10"
          fill={`url(#${id}-z)`}
          stroke="#a16207"
          strokeWidth={0.8}
          strokeLinejoin="round"
        />
        <defs>
          <linearGradient id={`${id}-z`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fde047" />
            <stop offset="1" stopColor="#ca8a04" />
          </linearGradient>
        </defs>
      </g>
    ),
  },
  // 🌟 闪耀星
  combo_50: {
    from: '#fde68a',
    to: '#b45309',
    render: (id) => (
      <g>
        <polygon
          points="24,8 27.5,19 39,19 30,26 33,38 24,31 15,38 18,26 9,19 20.5,19"
          fill={`url(#${id}-s)`}
          stroke="#a16207"
          strokeWidth={0.8}
          strokeLinejoin="round"
        />
        <circle cx="24" cy="24" r="3" fill="#fef9c3" />
        <defs>
          <radialGradient id={`${id}-s`}>
            <stop offset="0" stopColor="#fef08a" />
            <stop offset="1" stopColor="#d97706" />
          </radialGradient>
        </defs>
      </g>
    ),
  },
  // 📅 日历 3
  streak_3: {
    from: '#bae6fd',
    to: '#0369a1',
    render: (id) => (
      <g>
        <rect x="11" y="13" width="26" height="22" rx="3" fill={`url(#${id}-b)`} />
        <rect x="11" y="13" width="26" height="6" rx="3" fill="#0369a1" />
        <line x1="17" y1="11" x2="17" y2="17" stroke="#fff" strokeWidth={2} strokeLinecap="round" />
        <line x1="31" y1="11" x2="31" y2="17" stroke="#fff" strokeWidth={2} strokeLinecap="round" />
        <text x="24" y="31" fontSize="11" fontWeight="700" fill="#fff" textAnchor="middle" fontFamily="sans-serif">3</text>
        <defs>
          <linearGradient id={`${id}-b`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#7dd3fc" />
            <stop offset="1" stopColor="#0369a1" />
          </linearGradient>
        </defs>
      </g>
    ),
  },
  // 🗓️ 日历 7
  streak_7: {
    from: '#bbf7d0',
    to: '#15803d',
    render: (id) => (
      <g>
        <rect x="11" y="13" width="26" height="22" rx="3" fill={`url(#${id}-b)`} />
        <rect x="11" y="13" width="26" height="6" rx="3" fill="#15803d" />
        <line x1="17" y1="11" x2="17" y2="17" stroke="#fff" strokeWidth={2} strokeLinecap="round" />
        <line x1="31" y1="11" x2="31" y2="17" stroke="#fff" strokeWidth={2} strokeLinecap="round" />
        <text x="24" y="31" fontSize="11" fontWeight="700" fill="#fff" textAnchor="middle" fontFamily="sans-serif">7</text>
        <defs>
          <linearGradient id={`${id}-b`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#86efac" />
            <stop offset="1" stopColor="#15803d" />
          </linearGradient>
        </defs>
      </g>
    ),
  },
  // 👑 王冠
  streak_30: {
    from: '#fde68a',
    to: '#b45309',
    render: (id) => (
      <g>
        <path
          d="M 8 32 L 12 16 L 18 24 L 24 12 L 30 24 L 36 16 L 40 32 Z"
          fill={`url(#${id}-c)`}
          stroke="#92400e"
          strokeWidth={0.8}
          strokeLinejoin="round"
        />
        <rect x="8" y="32" width="32" height="4" rx="1" fill="#92400e" />
        <circle cx="12" cy="16" r="2" fill="#ef4444" />
        <circle cx="24" cy="12" r="2" fill="#22c55e" />
        <circle cx="36" cy="16" r="2" fill="#3b82f6" />
        <defs>
          <linearGradient id={`${id}-c`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fde047" />
            <stop offset="1" stopColor="#b45309" />
          </linearGradient>
        </defs>
      </g>
    ),
  },
  // ✍️ 笔
  answers_100: {
    from: '#e2e8f0',
    to: '#475569',
    render: (id) => (
      <g>
        <polygon points="12,36 18,30 38,10 42,14 22,34 16,40" fill={`url(#${id}-p)`} />
        <polygon points="38,10 42,14 40,8" fill="#fde047" />
        <polygon points="12,36 16,40 11,41" fill="#1e293b" />
        <line x1="20" y1="32" x2="14" y2="38" stroke="#fff" strokeWidth={1} strokeLinecap="round" />
        <defs>
          <linearGradient id={`${id}-p`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#94a3b8" />
            <stop offset="1" stopColor="#334155" />
          </linearGradient>
        </defs>
      </g>
    ),
  },
  // 🎯 靶
  accuracy_90: {
    from: '#fecaca',
    to: '#b91c1c',
    render: (id) => (
      <g>
        <circle cx="24" cy="24" r="14" fill="#fff" stroke="#b91c1c" strokeWidth={1.5} />
        <circle cx="24" cy="24" r="10" fill="#fee2e2" stroke="#b91c1c" strokeWidth={1.5} />
        <circle cx="24" cy="24" r="6" fill="#fca5a5" stroke="#b91c1c" strokeWidth={1.5} />
        <circle cx="24" cy="24" r="2.5" fill={`url(#${id}-b)`} />
        <line x1="32" y1="16" x2="38" y2="10" stroke="#1e293b" strokeWidth={1.5} strokeLinecap="round" />
        <polygon points="38,10 36,14 34,12" fill="#1e293b" />
        <defs>
          <radialGradient id={`${id}-b`}>
            <stop offset="0" stopColor="#fde047" />
            <stop offset="1" stopColor="#b91c1c" />
          </radialGradient>
        </defs>
      </g>
    ),
  },
};

const TIER_RING: Record<string, string> = {
  common: '#a3a3a3',
  rare: '#3b82f6',
  epic: '#a855f7',
  legendary: '#f59e0b',
};

const BadgeIcon: React.FC<Props & { tier?: string }> = ({
  code,
  size = 48,
  unlocked = true,
  tier = 'common',
}) => {
  const visual = VISUALS[code];
  const id = `badge-${code}`;
  const ring = TIER_RING[tier] ?? TIER_RING.common;

  const content = visual ? (
    <>
      <defs>
        <radialGradient id={`${id}-bg`}>
          <stop offset="0" stopColor={visual.from} stopOpacity={0.5} />
          <stop offset="1" stopColor={visual.to} stopOpacity={0.05} />
        </radialGradient>
      </defs>
      <circle cx="24" cy="24" r="22" fill={`url(#${id}-bg)`} />
      <circle cx="24" cy="24" r="22" fill="none" stroke={ring} strokeWidth={1.6} />
      {visual.render(id)}
    </>
  ) : (
    <>
      <circle cx="24" cy="24" r="22" fill="#f4f4f5" />
      <circle cx="24" cy="24" r="22" fill="none" stroke={ring} strokeWidth={1.6} />
      <text
        x="24"
        y="29"
        fontSize="14"
        fontWeight="700"
        fill="#a3a3a3"
        textAnchor="middle"
        fontFamily="sans-serif"
      >
        ?
      </text>
    </>
  );

  return (
    <svg
      viewBox="0 0 48 48"
      width={size}
      height={size}
      style={{
        filter: unlocked ? undefined : 'grayscale(1)',
        opacity: unlocked ? 1 : 0.45,
        display: 'block',
      }}
    >
      {content}
    </svg>
  );
};

export default BadgeIcon;
