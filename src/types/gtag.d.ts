interface Window {
  gtag: (
    command: 'event',
    action: string,
    params: {
      event_category?: string;
      event_label?: string;
      value?: number;
      non_interaction?: boolean;
      [key: string]: any;
    }
  ) => void;
  dataLayer?: Array<Record<string, unknown>>;
}
