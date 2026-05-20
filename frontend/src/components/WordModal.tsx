import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Button, Empty, Modal, Segmented, Spin, Tag, message } from 'antd';
import { createStyles } from 'antd-style';
import { api } from '@/api';
import type { WordInfo } from '@/api/types';
import { useAuthStore } from '@/store/auth';
import { hasLearned, markLearned as markLearnedLocal } from '@/lib/learnedCache';

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

const useStyles = createStyles(({ css }) => ({
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
    background: 'linear-gradient(135deg, #fafafa 0%, #ffffff 100%)',
    borderBottom: '1px solid #f0f0f0',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  }),
  word: css({
    fontSize: 28,
    fontWeight: 700,
    color: '#18181b',
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
    border: '1px solid #f0f0f0',
    background: '#fafafa',
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
    fontSize: 13,
    color: '#262626',
    fontWeight: 600,
  }),
  formValue: css({
    fontSize: 18,
    color: '#18181b',
    fontWeight: 600,
  }),
  example: css({
    background: '#ffffff',
    border: '1px solid #f0f0f0',
    borderRadius: 10,
    padding: '12px 14px',
    marginTop: 10,
    '&:first-of-type': {
      marginTop: 0,
    },
  }),
  en: css({
    fontSize: 14,
    color: '#18181b',
    lineHeight: 1.6,
    marginBottom: 4,
  }),
  zh: css({
    fontSize: 13,
    color: '#737373',
    lineHeight: 1.6,
  }),
  input: css({
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #e4e4e7',
    borderRadius: 8,
    fontSize: 14,
    outline: 'none',
    transition: 'all 0.2s ease',
    background: '#ffffff',
    color: '#18181b',
    '&:focus': {
      borderColor: '#18181b',
    },
  }),
  inputCorrect: css({
    borderColor: '#22c55e !important',
    background: '#f0fdf4',
  }),
  inputWrong: css({
    borderColor: '#ef4444 !important',
    background: '#fef2f2',
  }),
  result: css({
    marginTop: 6,
    fontSize: 12,
    color: '#737373',
  }),
}));

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
  const { styles, cx } = useStyles();
  const profile = useAuthStore((s) => s.profile);
  const refresh = useAuthStore((s) => s.refresh);

  const [info, setInfo] = useState<WordInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'study' | 'practice'>(() => {
    const v = localStorage.getItem('fsw-modal-mode');
    return v === 'practice' ? 'practice' : 'study';
  });

  const updateMode = (next: 'study' | 'practice') => {
    setMode(next);
    localStorage.setItem('fsw-modal-mode', next);
  };
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
    if (hasLearned(word)) return; // 本次会话已通知过，跳过
    api.practice.learned(word).then(() => {
      markLearnedLocal(word);
      refresh();
    });
  }, [open, word, profile, refresh]);

  const normalize = (s: string) =>
    s.toLowerCase().replace(/[.,!?;:"']/g, '').replace(/\s+/g, ' ').trim();

  const onInput = (formType: string, idx: number, value: string) => {
    setExamples((prev) => {
      const list = prev[formType]?.slice() ?? [];
      if (!list[idx]) return prev;
      // 答错重新编辑时，清掉上一次的红色状态，让用户专注当前输入
      const ex = {
        ...list[idx],
        input: value,
        status: list[idx].status === 'incorrect' ? '' : list[idx].status,
      };
      list[idx] = ex;
      return { ...prev, [formType]: list };
    });
  };

  const submit = async (formType: string, idx: number) => {
    const ex = examples[formType]?.[idx];
    if (!ex || !word) return;
    // 已答对的题目不再处理
    if (ex.submitted && ex.status === 'correct') return;

    const correct = normalize(ex.input) === normalize(ex.expected);
    setExamples((prev) => {
      const list = prev[formType]?.slice() ?? [];
      list[idx] = {
        ...ex,
        status: correct ? 'correct' : 'incorrect',
        // 仅在答对时锁定输入；答错允许继续修改重试
        submitted: correct,
      };
      return { ...prev, [formType]: list };
    });

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
          message.info('已掌握，不再重复给奖励');
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

  const formEntries = useMemo(
    () =>
      Object.entries(info?.forms ?? {}).filter(
        ([, v]) => v && v.value,
      ) as Array<[string, NonNullable<WordInfo['forms'][string]>]>,
    [info],
  );

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={620}
      destroyOnHidden
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
          <Segmented
            value={mode}
            onChange={(v) => updateMode(v as 'study' | 'practice')}
            options={[
              { label: '学习', value: 'study' },
              { label: '练习', value: 'practice' },
            ]}
          />
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
          <div style={{ padding: 60, textAlign: 'center' }}>
            <Spin tip="正在加载词义..." />
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
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') submit(type, i);
                          }}
                          placeholder={
                            ex.status === 'correct'
                              ? '已答对'
                              : ex.status === 'incorrect'
                              ? '不对，再试一次（回车提交）'
                              : '请输入对应的英文句子，回车提交'
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
