import { useEffect } from 'react';
import { eventBus } from '../shared/eventBus';
import { EventMap } from '../shared/types';

export const useHostLifecycle = () => {
  useEffect(() => {
    // Emit host loaded event
    eventBus.emit('microfrontend:loaded', {
      name: 'host',
      timestamp: Date.now(),
    } as EventMap['microfrontend:loaded']);
  }, []);
};

