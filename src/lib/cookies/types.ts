export enum CookieCategory {
  FUNCTIONAL = 'functional',
  ANALYTICAL = 'analytical',
  MARKETING = 'marketing',
  THIRD_PARTY = 'thirdParty'
}

export interface CookieConsent {
  functional: boolean;
  analytical: boolean;
  marketing: boolean;
  thirdParty: boolean;
  timestamp: string;
  version: string;
}

export interface CookieCategories {
  functional: boolean;
  analytical: boolean;
  marketing: boolean;
  thirdParty: boolean;
}