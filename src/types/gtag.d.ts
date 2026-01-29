type ConsentArg = 'default' | 'update';
type ConsentParams = {
  ad_storage?: 'granted' | 'denied';
  ad_user_data?: 'granted' | 'denied';
  ad_personalization?: 'granted' | 'denied';
  analytics_storage?: 'granted' | 'denied';
  wait_for_update?: number;
};

interface Window {
  gtag: {
    (
      command: 'event',
      action: string,
      params: {
        event_category?: string;
        event_label?: string;
        value?: number;
        non_interaction?: boolean;
        [key: string]: unknown;
      }
    ): void;
    (
      command: 'consent',
      arg: ConsentArg,
      params: ConsentParams
    ): void;
    (
      command: 'set',
      key: string,
      value: unknown
    ): void;
    (
      command: 'config',
      targetId: string,
      config?: Record<string, unknown>
    ): void;
  };
  dataLayer?: Array<Record<string, unknown>>;
}
