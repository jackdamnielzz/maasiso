interface Window {
  gtag: {
    (command: 'config', targetId: string, config?: any): void;
    (command: 'js', date: Date): void;
    (command: 'event', action: string, params?: {
      event_category?: string;
      event_label?: string;
      value?: number;
      non_interaction?: boolean;
      send_to?: string;
      [key: string]: any;
    }): void;
  };
}