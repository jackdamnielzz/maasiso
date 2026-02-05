import type { PageRole } from './pageRoles';

export const CORE_TEMPLATE_IDS = ['coreHub', 'coreDetail', 'blog', 'conversion'] as const;
export type TemplateId = (typeof CORE_TEMPLATE_IDS)[number];

export const CORE_HUB_IDS = [
  'iso-certificering',
  'informatiebeveiliging',
  'avg-wetgeving',
  'waarom-maasiso',
] as const;
export type CoreHubId = (typeof CORE_HUB_IDS)[number];

export const CORE_DETAIL_IDS = [
  'iso-9001',
  'iso-14001',
  'iso-45001',
  'iso-16175',
  'iso-27001',
  'bio',
  'avg',
] as const;
export type CoreDetailId = (typeof CORE_DETAIL_IDS)[number];

type CmsModel = 'strapi.page' | 'strapi.blog-post' | 'none';

export type HubRouteConfig = {
  role: Extract<PageRole, 'hub'>;
  template: Extract<TemplateId, 'coreHub'>;
  path: `/${CoreHubId}`;
  hubId: CoreHubId;
  cmsModel: CmsModel;
  children: Array<CoreDetailId>;
};

export type DetailRouteConfig = {
  role: Extract<PageRole, 'detail'>;
  template: Extract<TemplateId, 'coreDetail'>;
  path: string;
  hubId: CoreHubId;
  detailId: CoreDetailId;
  cmsModel: Extract<CmsModel, 'strapi.page'>;
  strapiSlug: string;
};

export const CORE_HUB_ROUTES: Record<CoreHubId, HubRouteConfig> = {
  'iso-certificering': {
    role: 'hub',
    template: 'coreHub',
    path: '/iso-certificering',
    hubId: 'iso-certificering',
    cmsModel: 'none',
    children: ['iso-9001', 'iso-14001', 'iso-45001', 'iso-16175'],
  },
  'informatiebeveiliging': {
    role: 'hub',
    template: 'coreHub',
    path: '/informatiebeveiliging',
    hubId: 'informatiebeveiliging',
    cmsModel: 'none',
    children: ['iso-27001', 'bio'],
  },
  'avg-wetgeving': {
    role: 'hub',
    template: 'coreHub',
    path: '/avg-wetgeving',
    hubId: 'avg-wetgeving',
    cmsModel: 'none',
    children: ['avg'],
  },
  'waarom-maasiso': {
    role: 'hub',
    template: 'coreHub',
    path: '/waarom-maasiso',
    hubId: 'waarom-maasiso',
    cmsModel: 'none',
    children: [],
  },
};

export const CORE_DETAIL_ROUTES: Record<CoreDetailId, DetailRouteConfig> = {
  'iso-9001': {
    role: 'detail',
    template: 'coreDetail',
    path: '/iso-certificering/iso-9001',
    hubId: 'iso-certificering',
    detailId: 'iso-9001',
    cmsModel: 'strapi.page',
    strapiSlug: 'iso-9001',
  },
  'iso-14001': {
    role: 'detail',
    template: 'coreDetail',
    path: '/iso-certificering/iso-14001',
    hubId: 'iso-certificering',
    detailId: 'iso-14001',
    cmsModel: 'strapi.page',
    strapiSlug: 'iso-14001',
  },
  'iso-45001': {
    role: 'detail',
    template: 'coreDetail',
    path: '/iso-certificering/iso-45001',
    hubId: 'iso-certificering',
    detailId: 'iso-45001',
    cmsModel: 'strapi.page',
    strapiSlug: 'iso-45001',
  },
  'iso-16175': {
    role: 'detail',
    template: 'coreDetail',
    path: '/iso-certificering/iso-16175',
    hubId: 'iso-certificering',
    detailId: 'iso-16175',
    cmsModel: 'strapi.page',
    strapiSlug: 'iso-16175',
  },
  'iso-27001': {
    role: 'detail',
    template: 'coreDetail',
    path: '/informatiebeveiliging/iso-27001',
    hubId: 'informatiebeveiliging',
    detailId: 'iso-27001',
    cmsModel: 'strapi.page',
    strapiSlug: 'iso-27001',
  },
  bio: {
    role: 'detail',
    template: 'coreDetail',
    path: '/informatiebeveiliging/bio',
    hubId: 'informatiebeveiliging',
    detailId: 'bio',
    cmsModel: 'strapi.page',
    strapiSlug: 'bio',
  },
  avg: {
    role: 'detail',
    template: 'coreDetail',
    path: '/avg-wetgeving/avg',
    hubId: 'avg-wetgeving',
    detailId: 'avg',
    cmsModel: 'strapi.page',
    strapiSlug: 'avg',
  },
};

export const CORE_PAGE_PATHS = [
  ...Object.values(CORE_HUB_ROUTES).map((r) => r.path),
  ...Object.values(CORE_DETAIL_ROUTES).map((r) => r.path),
] as const;

export type CorePagePath = (typeof CORE_PAGE_PATHS)[number];

export const CORE_PAGE_PATH_SET: ReadonlySet<string> = new Set(CORE_PAGE_PATHS);

export function isCorePagePath(pathname: string): pathname is CorePagePath {
  return CORE_PAGE_PATH_SET.has(pathname);
}

export function isCoreHubPath(pathname: string): boolean {
  return Object.values(CORE_HUB_ROUTES).some((r) => r.path === pathname);
}

export function isCoreDetailPath(pathname: string): boolean {
  return Object.values(CORE_DETAIL_ROUTES).some((r) => r.path === pathname);
}

export function getHubForDetail(detailId: CoreDetailId) {
  return CORE_HUB_ROUTES[CORE_DETAIL_ROUTES[detailId].hubId];
}

export const CORE_RESERVED_SINGLE_SLUGS: ReadonlySet<string> = new Set([
  ...CORE_HUB_IDS,
  ...CORE_DETAIL_IDS,
  // Non-core top-level routes that must never be created via generic CMS pages
  'blog',
  'contact',
  'over-ons',
  'over-niels-maas',
  'privacy-policy',
  'terms-and-conditions',
  'cookie-policy',
  'search',
  'whitepaper',
]);

export function isReservedSingleSlug(slug: string): boolean {
  return CORE_RESERVED_SINGLE_SLUGS.has(slug);
}

