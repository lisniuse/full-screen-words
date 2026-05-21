import { useMemo } from 'react';
import { theme } from 'antd';
import type { ConfigProviderProps } from 'antd';
import type { ThemeMode } from '@/store/theme';

/**
 * shadcn 风格 antd 主题。
 * - light: zinc 浅色 + 接近 #fafafa 的 layout 背景
 * - dark : zinc-950/900/800 黑灰阶 + 反相按钮（primary = 白）
 *
 * 仅通过 token + components 配置覆盖；ButtonProps.classNames 不支持函数形式
 * 也用不上，移除可避免类型错误。
 */

const lightTokens = {
  colorPrimary: '#262626',
  colorSuccess: '#22c55e',
  colorWarning: '#f97316',
  colorError: '#ef4444',
  colorInfo: '#262626',
  colorTextBase: '#262626',
  colorBgBase: '#ffffff',

  colorPrimaryBg: '#f5f5f5',
  colorPrimaryBgHover: '#e5e5e5',
  colorPrimaryBorder: '#d4d4d4',
  colorPrimaryBorderHover: '#a3a3a3',
  colorPrimaryHover: '#404040',
  colorPrimaryActive: '#171717',
  colorPrimaryText: '#262626',
  colorPrimaryTextHover: '#404040',
  colorPrimaryTextActive: '#171717',

  colorText: '#262626',
  colorTextSecondary: '#525252',
  colorTextTertiary: '#737373',
  colorTextQuaternary: '#a3a3a3',
  colorTextDisabled: '#a3a3a3',

  colorBgContainer: '#ffffff',
  colorBgElevated: '#ffffff',
  colorBgLayout: '#fafafa',
  colorBgSpotlight: 'rgba(38, 38, 38, 0.85)',
  colorBgMask: 'rgba(38, 38, 38, 0.45)',

  colorBorder: '#e5e5e5',
  colorBorderSecondary: '#f5f5f5',
};

const darkTokens = {
  colorPrimary: '#fafafa',
  colorSuccess: '#22c55e',
  colorWarning: '#f97316',
  colorError: '#ef4444',
  colorInfo: '#fafafa',
  colorTextBase: '#fafafa',
  colorBgBase: '#09090b',

  colorPrimaryBg: '#27272a',
  colorPrimaryBgHover: '#3f3f46',
  colorPrimaryBorder: '#52525b',
  colorPrimaryBorderHover: '#71717a',
  colorPrimaryHover: '#e4e4e7',
  colorPrimaryActive: '#ffffff',
  colorPrimaryText: '#fafafa',
  colorPrimaryTextHover: '#e4e4e7',
  colorPrimaryTextActive: '#ffffff',

  colorText: '#fafafa',
  colorTextSecondary: '#d4d4d8',
  colorTextTertiary: '#a1a1aa',
  colorTextQuaternary: '#71717a',
  colorTextDisabled: '#52525b',

  colorBgContainer: '#18181b',
  colorBgElevated: '#27272a',
  colorBgLayout: '#0a0a0a',
  // Tooltip/Popover 等 spotlight：保持深色 + 白字可读
  colorBgSpotlight: 'rgba(63, 63, 70, 0.96)',
  colorBgMask: 'rgba(0, 0, 0, 0.55)',

  colorBorder: '#27272a',
  colorBorderSecondary: '#1f1f23',

  // primary 反相到白底之后，按钮文字（默认 colorTextLightSolid = 白）会跟背景同色看不见，
  // 强制把"叠在 primary 实色背景上的文字"换成深色
  colorTextLightSolid: '#18181b',
};

const sharedRadius = {
  borderRadius: 10,
  borderRadiusXS: 2,
  borderRadiusSM: 6,
  borderRadiusLG: 14,
  padding: 16,
  paddingSM: 12,
  paddingLG: 24,
  margin: 16,
  marginSM: 12,
  marginLG: 24,
  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
  boxShadowSecondary:
    '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
};

const useShadcnTheme = (mode: ThemeMode = 'light') => {
  return useMemo<ConfigProviderProps>(
    () => ({
      theme: {
        algorithm: mode === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          ...(mode === 'dark' ? darkTokens : lightTokens),
          ...sharedRadius,
        },
        components: {
          Button: {
            primaryShadow: 'none',
            defaultShadow: 'none',
            dangerShadow: 'none',
            borderRadius: 6,
          },
          Input: {
            activeShadow: 'none',
            borderRadius: 6,
          },
          Select: {
            optionSelectedFontWeight: 500,
            borderRadius: 6,
          },
          Alert: { borderRadiusLG: 8 },
          Modal: { borderRadiusLG: 12 },
          Progress: {
            defaultColor: mode === 'dark' ? '#fafafa' : '#18181b',
            remainingColor: mode === 'dark' ? '#27272a' : '#f4f4f5',
          },
          Steps: { iconSize: 32 },
          Switch: {
            trackHeight: 24,
            trackMinWidth: 44,
            innerMinMargin: 4,
            innerMaxMargin: 24,
          },
          Checkbox: { borderRadiusSM: 4 },
          Slider: {
            trackBg: mode === 'dark' ? '#27272a' : '#f4f4f5',
            trackHoverBg: mode === 'dark' ? '#3f3f46' : '#e4e4e7',
            handleSize: 18,
            handleSizeHover: 20,
            railSize: 6,
          },
          ColorPicker: { borderRadius: 6 },
        },
      },
    }),
    [mode],
  );
};
export default useShadcnTheme;
