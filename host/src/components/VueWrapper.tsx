import React, { useEffect, useRef, useState } from 'react';

interface VueWrapperProps {
  componentLoader: () => Promise<{ default: any }>;
}

const VueWrapper: React.FC<VueWrapperProps> = ({ componentLoader }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadAndMount = async () => {
      try {
        // Загружаем Vue и компонент
        const [{ createApp }, componentModule] = await Promise.all([
          import('vue'),
          componentLoader()
        ]);

        if (!mounted) return;

        // Ждём пока контейнер появится в DOM
        const waitForContainer = () => {
          return new Promise<void>((resolve) => {
            const check = () => {
              if (containerRef.current) {
                resolve();
              } else {
                requestAnimationFrame(check);
              }
            };
            check();
          });
        };

        await waitForContainer();
        if (!mounted || !containerRef.current) return;

        const VueComponent = componentModule.default;

        if (appRef.current) {
          appRef.current.unmount();
        }

        const app = createApp(VueComponent);
        app.mount(containerRef.current);
        appRef.current = app;
        setLoading(false);
      } catch (err) {
        console.error('Vue component loading error:', err);
        if (mounted) {
          setError('Ошибка загрузки Vue компонента');
          setLoading(false);
        }
      }
    };

    loadAndMount();

    return () => {
      mounted = false;
      if (appRef.current) {
        appRef.current.unmount();
        appRef.current = null;
      }
    };
  }, [componentLoader]);

  if (error) {
    return <div style={{ padding: '20px', color: 'red' }}>{error}</div>;
  }

  return (
    <>
      {loading && <div style={{ padding: '20px', textAlign: 'center' }}>Загрузка Vue компонента...</div>}
      <div ref={containerRef} style={{ display: loading ? 'none' : 'block' }}></div>
    </>
  );
};

export default VueWrapper;

