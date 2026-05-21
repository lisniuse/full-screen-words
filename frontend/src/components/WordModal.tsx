import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Button, Empty, Modal, Segmented, Spin, Tag, Tooltip, message } from 'antd';
import { createStyles } from 'antd-style';
import { api } from '@/api';
import type { WordInfo } from '@/api/types';
import { useAuthStore } from '@/store/auth';
import { useThemeStore } from '@/store/theme';
import { useLearnedStore } from '@/store/learned';
import {
  addMarkedThisSession,
  hasMarkedThisSession,
} from '@/lib/markedSessionCache';

const FORM_LABEL: Record<string, string> = {
  base: '原形',
  past: '过去式',
  pastParticiple: '过去分词',
  presentParticiple: '现在分词',
  thirdPerson: '第三人称单数',
  plural: '复数',
  comparative: '比较级',
  superlative: '最高级',
};

type FontSize = 'small' | 'medium' | 'large';

const FONT_SCALE: Record<FontSize, number> = {
  small: 1,
  medium: 1.2,
  large: 1.4,
};

const useStyles = createStyles(
  (
    { css, token },
    { isDark, scale }: { isDark: boolean; scale: number },
  ) => ({
  modal: css({
    '.ant-modal-content': {
      borderRadius: 16,
      padding: 0,
      overflow: 'hidden',
    },
    '.ant-modal-body': {
      padding: 0,
    },
  }),
  header: css({
    padding: '20px 24px 16px',
    background: isDark
      ? `linear-gradient(135deg, ${token.colorBgLayout} 0%, ${token.colorBgContainer} 100%)`
      : `linear-gradient(135deg, ${token.colorBgLayout} 0%, ${token.colorBgContainer} 100%)`,
    borderBottom: `1px solid ${token.colorBorderSecondary}`,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  }),
  word: css({
    fontSize: 28,
    fontWeight: 700,
    color: token.colorText,
    lineHeight: 1.1,
    letterSpacing: 0.2,
  }),
  toolbar: css({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    flexWrap: 'wrap',
  }),
  body: css({
    padding: '20px 24px 24px',
    maxHeight: '60vh',
    overflowY: 'auto',
  }),
  formCard: css({
    border: `1px solid ${token.colorBorderSecondary}`,
    background: token.colorBgLayout,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    transition: 'all 0.2s ease',
    '&:last-child': {
      marginBottom: 0,
    },
  }),
  formHead: css({
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  }),
  formTitle: css({
    fontSize: Math.round(13 * scale),
    color: token.colorTextSecondary,
    fontWeight: 600,
  }),
  formValue: css({
    fontSize: Math.round(18 * scale),
    color: token.colorText,
    fontWeight: 600,
  }),
  example: css({
    background: token.colorBgContainer,
    border: `1px solid ${token.colorBorderSecondary}`,
    borderRadius: 10,
    padding: '12px 14px',
    marginTop: 10,
    '&:first-of-type': {
      marginTop: 0,
    },
  }),
  en: css({
    fontSize: Math.round(14 * scale),
    color: token.colorText,
    lineHeight: 1.6,
    marginBottom: 4,
    // 单行显示；弹窗宽度由 JS 按最长句子计算，少数极长句子超出时改横向滚动
    whiteSpace: 'nowrap',
    overflowX: 'auto',
  }),
  zh: css({
    fontSize: Math.round(13 * scale),
    color: token.colorTextTertiary,
    lineHeight: 1.6,
  }),
  input: css({
    width: '100%',
    padding: '8px 12px',
    border: `1px solid ${token.colorBorder}`,
    borderRadius: 8,
    fontSize: Math.round(14 * scale),
    outline: 'none',
    transition: 'all 0.2s ease',
    background: token.colorBgContainer,
    color: token.colorText,
    whiteSpace: 'nowrap',
    overflowX: 'auto',
    '&:focus': {
      borderColor: token.colorText,
    },
    '&:disabled': {
      background: token.colorBgLayout,
      color: token.colorTextTertiary,
      cursor: 'not-allowed',
    },
  }),
  modeHint: css({
    fontSize: 11,
    color: token.colorTextTertiary,
    marginLeft: 8,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
  }),
  kbdBadge: css({
    display: 'inline-block',
    padding: '0 5px',
    minWidth: 22,
    textAlign: 'center',
    border: `1px solid ${token.colorBorder}`,
    borderBottomWidth: 2,
    borderRadius: 4,
    background: token.colorBgLayout,
    fontFamily:
      'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
    fontSize: 10,
    color: token.colorText,
    lineHeight: '14px',
  }),
  inputCorrect: css({
    borderColor: `${token.colorSuccess} !important`,
    background: `${isDark ? 'rgba(34,197,94,0.12)' : '#f0fdf4'} !important`,
  }),
  inputWrong: css({
    borderColor: `${token.colorError} !important`,
    background: `${isDark ? 'rgba(239,68,68,0.12)' : '#fef2f2'} !important`,
  }),
  result: css({
    marginTop: 6,
    fontSize: 12,
    color: token.colorTextTertiary,
  }),
  loading: css({
    padding: 60,
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12,
  }),
  loadingTip: css({
    fontSize: 13,
    color: token.colorTextTertiary,
  }),
}),
);

interface ExampleState {
  expected: string;
  zh: string;
  input: string;
  status: '' | 'correct' | 'incorrect';
  submitted: boolean;
}

const WordModal: React.FC<{
  word: string | null;
  open: boolean;
  onClose: () => void;
}> = ({ word, open, onClose }) => {
  const isDark = useThemeStore((s) => s.mode === 'dark');
  const profile = useAuthStore((s) => s.profile);
  const refresh = useAuthStore((s) => s.refresh);

  const [info, setInfo] = useState<WordInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'study' | 'practice'>(() => {
    const v = localStorage.getItem('fsw-modal-mode');
    return v === 'practice' ? 'practice' : 'study';
  });
  const [fontSize, setFontSize] = useState<FontSize>(() => {
    const v = localStorage.getItem('fsw-modal-fontsize');
    return v === 'small' || v === 'large' ? v : 'medium';
  });

  /** focus 第一个未答对（未 disabled）的练习输入框 */
  const focusFirstPracticeInput = () => {
    setTimeout(() => {
      const root = document.querySelector('.ant-modal-content');
      if (!root) return;
      const input = root.querySelector<HTMLInputElement>(
        'input:not([type="radio"]):not([disabled])',
      );
      input?.focus();
    }, 60); // 让 React 把 <input> 挂上再 focus
  };

  const updateMode = (next: 'study' | 'practice') => {
    // 切 mode 之前清掉所有待发的 debounce 校验，避免 unmount 后的脏触发
    Object.values(debounceTimers.current).forEach((t) => clearTimeout(t));
    debounceTimers.current = {};
    setMode(next);
    localStorage.setItem('fsw-modal-mode', next);
    if (next === 'practice') focusFirstPracticeInput();
  };
  const updateFontSize = (next: FontSize) => {
    setFontSize(next);
    localStorage.setItem('fsw-modal-fontsize', next);
  };

  const { styles, cx } = useStyles({ isDark, scale: FONT_SCALE[fontSize] });

  // examplesRef / modeRef：避免 setTimeout 闭包拿到陈旧 state
  const examplesRef = useRef<Record<string, ExampleState[]>>({});
  const modeRef = useRef(mode);
  const debounceTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  useEffect(() => {
    examplesRef.current = examples;
  });
  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  // 关闭时清掉所有 debounce 计时器，避免泄漏
  useEffect(() => {
    if (open) return;
    Object.values(debounceTimers.current).forEach((t) => clearTimeout(t));
    debounceTimers.current = {};
  }, [open]);
  const [examples, setExamples] = useState<
    Record<string, ExampleState[]>
  >({});

  useEffect(() => {
    if (!open || !word) return;
    setInfo(null);
    setError(null);
    setExamples({});
    setLoading(true);

    Promise.all([
      api.words.info(word),
      profile
        ? api.practice
            .mastered(word)
            .catch(() => ({} as Record<string, number[]>))
        : Promise.resolve({} as Record<string, number[]>),
    ])
      .then(([data, mastered]) => {
        setInfo(data);
        const next: Record<string, ExampleState[]> = {};
        Object.entries(data?.forms ?? {}).forEach(([k, form]) => {
          if (form && form.examples) {
            const masteredSet = new Set(mastered[k] ?? []);
            next[k] = form.examples.map((e, idx) => {
              const done = masteredSet.has(idx);
              return {
                expected: e.en,
                zh: e.zh,
                input: done ? e.en : '',
                status: done ? ('correct' as const) : ('' as const),
                submitted: done,
              };
            });
          }
        });
        setExamples(next);
        // 数据就绪时如果当前是练习模式，把焦点放到第一个未答对的输入框
        if (modeRef.current === 'practice') focusFirstPracticeInput();
      })
      .catch((e) => {
        if (e?.response?.status === 401) {
          setError('登录后即可查看完整释义（按 ESC 打开登录面板）');
        } else {
          setError(e?.response?.data?.message || '加载失败');
        }
      })
      .finally(() => setLoading(false));
  }, [open, word, profile]);

  useEffect(() => {
    if (!open || !word || !profile) return;
    if (hasMarkedThisSession(word)) return;
    api.practice.learned(word).then(() => {
      addMarkedThisSession(word);
      refresh();
      // 注意：故意不调 learnedStore.add(word)
      // "已学"必须是"所有例句都答对"，仅打开 modal 不算
    });
  }, [open, word, profile, refresh]);

  /**
   * 校验前规范化：
   *  - 大小写不敏感
   *  - 忽略所有标点 / 符号（\p{P} \p{S}）
   *  - 空格数量不敏感（多空格折叠为一个）
   */
  const normalize = (s: string) =>
    s
      .toLowerCase()
      .replace(/[\p{P}\p{S}]/gu, '')
      .replace(/\s+/g, ' ')
      .trim();

  const VALIDATE_DEBOUNCE_MS = 550;

  const onInput = (formType: string, idx: number, value: string) => {
    setExamples((prev) => {
      const list = prev[formType]?.slice() ?? [];
      if (!list[idx]) return prev;
      // 一边重输一边清掉之前的状态色，输完停顿再统一判
      const ex = {
        ...list[idx],
        input: value,
        status: '' as '' | 'correct' | 'incorrect',
      };
      list[idx] = ex;
      return { ...prev, [formType]: list };
    });

    const key = `${formType}-${idx}`;
    const existingTimer = debounceTimers.current[key];
    if (existingTimer) clearTimeout(existingTimer);

    // 空输入不触发校验；保持中性
    if (!value.trim()) return;

    debounceTimers.current[key] = setTimeout(() => {
      delete debounceTimers.current[key];
      submit(formType, idx);
    }, VALIDATE_DEBOUNCE_MS);
  };

  /**
   * 校验输入：先本地比对，仅在 correct 时上报后端（结合 #1 的节流验证设计——
   * 错误输入只显示红框，不写流水也不消耗 combo）。
   */
  const submit = async (formType: string, idx: number) => {
    const ex = examplesRef.current[formType]?.[idx];
    if (!ex || !word) return;
    if (ex.submitted && ex.status === 'correct') return;
    if (!ex.input.trim()) return;

    const correct = normalize(ex.input) === normalize(ex.expected);

    setExamples((prev) => {
      const list = prev[formType]?.slice() ?? [];
      if (!list[idx]) return prev;
      list[idx] = {
        ...list[idx],
        status: correct ? 'correct' : 'incorrect',
        submitted: correct,
      };
      return { ...prev, [formType]: list };
    });

    if (!correct) return;

    if (!profile) {
      message.info('登录后可累计经验值和成长记录（按 ESC 打开面板）');
      return;
    }
    try {
      const res = await api.practice.submit({
        word,
        formType,
        exampleIndex: idx,
        actual: ex.input,
      });
      if (res.correct) {
        if (res.isRepeat) {
          message.info('复习模式 · 本次不计奖励');
        } else {
          message.success(`+${res.expGained} EXP · Combo ${res.combo}`);
        }
      }
      if (res.leveledUp) {
        message.success(`🎉 升级到 Lv.${res.level.level}！`);
      }
      res.unlockedBadges?.forEach((b) =>
        message.info(`🎉 解锁徽章：${b.icon} ${b.name}`),
      );
      await refresh();
    } catch {
      /* handled globally */
    }
  };

  // Tab 切换学习/练习（modal 打开时）
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      e.preventDefault();
      e.stopPropagation();
      const next = modeRef.current === 'study' ? 'practice' : 'study';
      updateMode(next);
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [open]);

  // 自适应宽度：DOM 临时元素实测最长例句的真实渲染像素宽
  // 同时把用户当前输入也算进去——如果敲的内容比原句还长，modal 跟着撑开
  const modalWidth = useMemo(() => {
    const collected: string[] = [];
    Object.values(examples).forEach((list) =>
      list?.forEach((e) => {
        collected.push(e.expected);
        if (e.input) collected.push(e.input);
      }),
    );
    if (collected.length === 0 || typeof document === 'undefined') return 620;

    const scale = FONT_SCALE[fontSize];
    const pxFontSize = Math.round(14 * scale);

    const probe = document.createElement('span');
    probe.style.cssText = [
      'position:fixed',
      'visibility:hidden',
      'pointer-events:none',
      'top:-9999px',
      'left:0',
      'white-space:nowrap',
      `font-size:${pxFontSize}px`,
      'font-family:inherit',
      'font-weight:400',
      'letter-spacing:normal',
    ].join(';');
    document.body.appendChild(probe);

    let longestPx = 0;
    for (const s of collected) {
      probe.textContent = s;
      longestPx = Math.max(longestPx, probe.scrollWidth);
    }
    document.body.removeChild(probe);

    // chrome：Modal body padding (24×2) + formCard padding (16×2) + example padding (14×2) +
    //         formCard/example border (1×4) + 滚动条/安全余量
    const chrome = 160;
    const estimated = Math.ceil(longestPx + chrome);

    const viewportMax = window.innerWidth - 32;
    return Math.max(620, Math.min(estimated, viewportMax));
  }, [examples, fontSize]);

  const formEntries = useMemo(
    () =>
      Object.entries(info?.forms ?? {}).filter(
        ([, v]) => v && v.value,
      ) as Array<[string, NonNullable<WordInfo['forms'][string]>]>,
    [info],
  );

  // "已学"判定：所有非空 form 的所有例句都 submitted + correct
  const allMastered = useMemo(() => {
    let hasAny = false;
    for (const list of Object.values(examples)) {
      if (!list || list.length === 0) continue;
      hasAny = true;
      for (const e of list) {
        if (!(e.submitted && e.status === 'correct')) return false;
      }
    }
    return hasAny;
  }, [examples]);

  // 全员答对的瞬间把当前 word 加入 learnedStore，让主页绿色高亮即时刷新
  useEffect(() => {
    if (!allMastered || !word) return;
    useLearnedStore.getState().add(word);
  }, [allMastered, word]);

  /** 重学：清空本次 modal 里所有例句的输入与状态，进入练习模式重新作答；
   *  服务端已有的 correct 记录会让 submit 返回 isRepeat=true，不再发奖励，
   *  也不变更任何 stats，纯粹复习用。 */
  const resetForReview = () => {
    Object.values(debounceTimers.current).forEach((t) => clearTimeout(t));
    debounceTimers.current = {};
    setExamples((prev) => {
      const next: Record<string, ExampleState[]> = {};
      for (const [k, list] of Object.entries(prev)) {
        next[k] = list.map((ex) => ({
          ...ex,
          input: '',
          status: '',
          submitted: false,
        }));
      }
      return next;
    });
    if (mode !== 'practice') updateMode('practice');
    else focusFirstPracticeInput();
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={modalWidth}
      destroyOnHidden
      maskClosable={false}
      className={styles.modal}
      title={null}
      closeIcon={null}
    >
      <div className={styles.header}>
        <div className={styles.toolbar} style={{ marginBottom: 4 }}>
          <div className={styles.word}>{word}</div>
          <Button size="small" type="text" onClick={onClose}>
            ✕
          </Button>
        </div>
        <div className={styles.toolbar}>
          <span style={{ display: 'inline-flex', alignItems: 'center' }}>
            <Segmented
              value={mode}
              onChange={(v) => updateMode(v as 'study' | 'practice')}
              options={[
                { label: '学习', value: 'study' },
                { label: '练习', value: 'practice' },
              ]}
            />
            <span className={styles.modeHint}>
              <span className={styles.kbdBadge}>Tab</span>
              <span>切换</span>
            </span>
          </span>
          <Tooltip title="正文字号">
            <Segmented
              size="small"
              value={fontSize}
              onChange={(v) => updateFontSize(v as FontSize)}
              options={[
                { label: <span style={{ fontSize: 11 }}>A</span>, value: 'small' },
                { label: <span style={{ fontSize: 13 }}>A</span>, value: 'medium' },
                { label: <span style={{ fontSize: 15 }}>A</span>, value: 'large' },
              ]}
            />
          </Tooltip>
          {allMastered && (
            <Tooltip title="清空本词所有例句的输入状态，重新练习一遍（不计经验、不影响统计）">
              <Button size="small" onClick={resetForReview}>
                重学
              </Button>
            </Tooltip>
          )}
          {profile ? (
            <Tag color="default">
              Lv.{profile.level.level} · {profile.stats.combo > 0 ? `🔥${profile.stats.combo}` : '准备答题'}
            </Tag>
          ) : (
            <Tag color="warning">未登录 · 答题不记录成长</Tag>
          )}
        </div>
      </div>

      <div className={styles.body}>
        {loading && (
          <div className={styles.loading}>
            <Spin />
            <div className={styles.loadingTip}>正在加载词义...</div>
          </div>
        )}
        {error && <Alert type="error" message={error} showIcon />}
        {!loading && !error && formEntries.length === 0 && (
          <Empty description="暂无释义" />
        )}
        {!loading &&
          !error &&
          formEntries.map(([type, form]) => (
            <div key={type} className={styles.formCard}>
              <div className={styles.formHead}>
                <span className={styles.formTitle}>{FORM_LABEL[type] ?? type}</span>
                <span className={styles.formValue}>{form.value}</span>
              </div>
              {form.examples?.map((_, i) => {
                const ex = examples[type]?.[i];
                if (!ex) return null;
                return (
                  <div key={i} className={styles.example}>
                    {mode === 'practice' ? (
                      <>
                        <input
                          className={cx(
                            styles.input,
                            ex.status === 'correct' && styles.inputCorrect,
                            ex.status === 'incorrect' && styles.inputWrong,
                          )}
                          value={ex.input}
                          onChange={(e) => onInput(type, i, e.target.value)}
                          placeholder={
                            ex.status === 'correct'
                              ? '已答对'
                              : ex.status === 'incorrect'
                              ? '不对，再试一次'
                              : '输入英文句子，停顿即校验'
                          }
                          disabled={ex.submitted && ex.status === 'correct'}
                        />
                        <div className={styles.zh} style={{ marginTop: 6 }}>
                          {ex.zh}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className={styles.en}>{ex.expected}</div>
                        <div className={styles.zh}>{ex.zh}</div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
      </div>
    </Modal>
  );
};

export default WordModal;
