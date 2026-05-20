import React, { useEffect, useState } from 'react';
import { Spin } from 'antd';
import WordsPage from '@/pages/WordsPage';
import EscOverlay from '@/components/EscOverlay';
import EscHint from '@/components/EscHint';
import { useAuthStore } from '@/store/auth';

const App: React.FC = () => {
  const init = useAuthStore((s) => s.init);
  const hydrated = useAuthStore((s) => s.hydrated);
  const [overlayOpen, setOverlayOpen] = useState(false);

  useEffect(() => {
    init();
  }, [init]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      // antd Modal / Drawer 自带 ESC 关闭，打开期间不拦截
      if (document.querySelector('.ant-modal-root, .ant-drawer-mask')) return;
      e.preventDefault();
      setOverlayOpen(true);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  if (!hydrated) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
        }}
      >
        <Spin />
      </div>
    );
  }

  return (
    <>
      <WordsPage />
      <EscHint onOpen={() => setOverlayOpen(true)} />
      <EscOverlay open={overlayOpen} onClose={() => setOverlayOpen(false)} />
    </>
  );
};

export default App;
