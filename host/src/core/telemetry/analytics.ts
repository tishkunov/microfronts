/**
 * Analytics service для Shell
 * Инициализируется один раз, используется для логирования navigation events
 */

interface AnalyticsConfig {
  trackingId?: string;
  enabled: boolean;
}

class Analytics {
  private config: AnalyticsConfig = {
    enabled: false,
  };

  init(config: AnalyticsConfig) {
    this.config = { ...this.config, ...config };
    
    // TODO: Инициализация Google Analytics / Yandex Metrica
    // if (this.config.trackingId) {
    //   gtag('config', this.config.trackingId);
    // }
  }

  trackPageView(path: string, previousPath?: string) {
    if (!this.config.enabled) return;

    console.log('[Analytics] Page view:', { path, previousPath });
    
    // TODO: Отправка в аналитику
    // gtag('event', 'page_view', { page_path: path });
  }

  trackEvent(eventName: string, params?: Record<string, any>) {
    if (!this.config.enabled) return;

    console.log('[Analytics] Event:', eventName, params);
    
    // TODO: Отправка в аналитику
    // gtag('event', eventName, params);
  }

  trackTiming(name: string, duration: number, label?: string) {
    if (!this.config.enabled) return;

    console.log('[Analytics] Timing:', { name, duration, label });
    
    // TODO: Отправка в аналитику
    // gtag('event', 'timing_complete', {
    //   name,
    //   value: duration,
    //   event_category: 'Performance',
    //   event_label: label,
    // });
  }
}

export const analytics = new Analytics();

