// ============================================================================
// INFRASTRUCTURE TYPES (Shell only)
// ============================================================================

// User info (read-only, infrastructure)
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  roles: string[];
}

// Shared state (infrastructure only, no business data)
export interface SharedState {
  user: User | null;
  theme: 'light' | 'dark';
  isLoading: boolean;
}

export const initialState: SharedState = {
  user: null,
  theme: 'light',
  isLoading: false,
};

// ============================================================================
// EVENT MAP (Shell defines infrastructure events, MF can extend)
// ============================================================================

export interface EventMap {
  // ============================================================================
  // INFRASTRUCTURE EVENTS
  // ============================================================================
  
  // Notification events
  'notification:show': { 
    type: 'success' | 'error' | 'info' | 'warning'; 
    message: string;
    duration?: number;
  };
  'notification:clear': void;
  
  // Navigation events
  'navigation:change': { path: string; params?: Record<string, string> };
  
  // Theme events
  'theme:change': { theme: 'light' | 'dark' };
  
  // User events
  'user:login': { userId: string; email: string };
  'user:logout': void;
  'user:updated': { userId: string; name?: string; avatar?: string };
  
  // Microfrontend lifecycle
  'microfrontend:loaded': { name: string; timestamp: number };
  'microfrontend:error': { name: string; error: string };
  
  // Data refresh
  'data:refresh': { source?: string };
  
  // ============================================================================
  // BUSINESS EVENTS (defined by MF, Shell just passes them through)
  // ============================================================================
  // Note: Business events like 'cart:updated', 'order:created' etc.
  // should be defined by MF, not Shell. Shell only provides EventBus infrastructure.
  
  // Generic business event type for type safety
  [key: string]: any;
}
