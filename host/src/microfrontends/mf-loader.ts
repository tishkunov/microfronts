/**
 * Dynamic microfrontend loader
 * Загружает MF по remoteEntry URL с retry логикой
 */

interface LoadMFOptions {
  name: string;
  url: string;
  retries?: number;
}

export const loadMicrofrontend = async (options: LoadMFOptions): Promise<any> => {
  const { name, url, retries = 3 } = options;

  for (let i = 0; i < retries; i++) {
    try {
      // Загрузка remoteEntry
      await loadRemoteEntry(url);
      
      // Динамический импорт MF
      const module = await import(`${name}/App`);
      return module.default;
    } catch (error) {
      console.error(`[MF Loader] Failed to load ${name} (attempt ${i + 1}/${retries}):`, error);
      
      if (i === retries - 1) {
        throw new Error(`Failed to load microfrontend ${name} after ${retries} attempts`);
      }
      
      // Exponential backoff
      await sleep(1000 * (i + 1));
    }
  }
};

const loadRemoteEntry = async (url: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = url;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script: ${url}`));
    document.head.appendChild(script);
  });
};

const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Preload microfrontend для оптимизации
 */
export const preloadMicrofrontend = (url: string): void => {
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = url;
  document.head.appendChild(link);
};

