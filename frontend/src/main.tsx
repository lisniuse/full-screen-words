import React from 'react';
import ReactDOM from 'react-dom/client';
import { ConfigProvider, App as AntApp } from 'antd';
import zhCN from 'antd/locale/zh_CN';

import App from './App';
import useShadcnTheme from './shadcnTheme';
import './styles/global.less';

const Root: React.FC = () => {
  const configProps = useShadcnTheme();
  return (
    <ConfigProvider locale={zhCN} {...configProps}>
      <AntApp>
        <App />
      </AntApp>
    </ConfigProvider>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
);
