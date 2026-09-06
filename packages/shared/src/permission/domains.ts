import { ACCESS_PERMISSIONS, PERMISSION_WILDCARD, WIKI_PERMISSIONS } from './keys'

export const GOVERNANCE_PERMISSIONS = {
  READ: 'governance.read',
  WRITE: 'governance.write',
  DELETE: 'governance.delete',
  ROLLBACK: 'governance.rollback',
  CHANGE_REQUEST: 'governance.change-request',
} as const

export const COMMUNITY_PERMISSIONS = {
  SECTION_MANAGE: 'governance.community.section.manage',
} as const

export const MODERATION_PERMISSIONS = {
  OVERVIEW_READ: 'moderation.overview.read',
  STATS_READ: 'moderation.stats.read',
  AUDIT_READ: 'moderation.audit.read',
  QUEUE_READ: 'moderation.queue.read',
  QUEUE_WRITE: 'moderation.queue.write',
  REPORTS_READ: 'moderation.reports.read',
  REPORTS_WRITE: 'moderation.reports.write',
  APPEALS_READ: 'moderation.appeals.read',
  APPEALS_WRITE: 'moderation.appeals.write',
  EPUB_READ: 'moderation.epub.read',
  EPUB_WRITE: 'moderation.epub.write',
  CONTENT_READ: 'moderation.content.read',
  CONTENT_WRITE: 'moderation.content.write',
  CONTENT_DELETE: 'moderation.content.delete',
  SETTINGS_READ: 'moderation.settings.read',
  SETTINGS_WRITE: 'moderation.settings.write',
} as const

export const USERS_PERMISSIONS = {
  LIST_READ: 'users.list.read',
  DETAIL_READ: 'users.detail.read',
  BAN_WRITE: 'users.ban.write',
  ROLE_WRITE: 'users.role.write',
} as const

export const IDP_PERMISSIONS = {
  OVERVIEW_READ: 'idp.overview.read',
  AUDIT_READ: 'idp.audit.read',
  RESTART_READ: 'idp.restart.read',
  RESTART_WRITE: 'idp.restart.write',
  IDENTITIES_READ: 'idp.identities.read',
  IDENTITIES_WRITE: 'idp.identities.write',
  OAUTH_READ: 'idp.oauth.read',
  OAUTH_WRITE: 'idp.oauth.write',
  OIDC_CLIENTS_READ: 'idp.oidc-clients.read',
  OIDC_CLIENTS_WRITE: 'idp.oidc-clients.write',
  SIGNING_KEYS_READ: 'idp.signing-keys.read',
  SIGNING_KEYS_WRITE: 'idp.signing-keys.write',
  SETTINGS_READ: 'idp.settings.read',
  SETTINGS_WRITE: 'idp.settings.write',
} as const

export const PLATFORM_PERMISSIONS = {
  SETTINGS_READ: 'platform.settings.read',
  SETTINGS_WRITE: 'platform.settings.write',
} as const

export const MEDIA_PERMISSIONS = {
  READ: 'media.read',
  SCAN_RUN: 'media.scan.run',
  GC_RUN: 'media.gc.run',
  SETTINGS_WRITE: 'media.settings.write',
  DELETE: 'media.delete',
} as const

export const READER_PERMISSIONS = {
  RENDER_REPORTS_READ: 'reader.render-reports.read',
  RENDER_REPORTS_WRITE: 'reader.render-reports.write',
} as const

export const PROMOTIONS_PERMISSIONS = {
  READ: 'promotions.read',
  WRITE: 'promotions.write',
} as const

export const RELEASE_NOTES_PERMISSIONS = {
  READ: 'release_notes.read',
  WRITE: 'release_notes.write',
} as const

export const DECORATIONS_PERMISSIONS = {
  READ: 'decorations.read',
  WRITE: 'decorations.write',
} as const

export const SEARCH_PERMISSIONS = {
  SETTINGS_READ: 'search.settings.read',
  SETTINGS_WRITE: 'search.settings.write',
  REINDEX_RUN: 'search.reindex.run',
} as const

export const TELEGRAM_PERMISSIONS = {
  SETTINGS_READ: 'telegram.settings.read',
  SETTINGS_WRITE: 'telegram.settings.write',
  ACCOUNTS_READ: 'telegram.accounts.read',
  ACCOUNTS_WRITE: 'telegram.accounts.write',
} as const

export const MANGA_PERMISSIONS = {
  DASHBOARD_READ: 'manga.dashboard.read',
  WORKS_READ: 'manga.works.read',
  WORKS_WRITE: 'manga.works.write',
  SOURCES_READ: 'manga.sources.read',
  SOURCES_WRITE: 'manga.sources.write',
  CHAPTERS_READ: 'manga.chapters.read',
  CHAPTERS_WRITE: 'manga.chapters.write',
  BACKFILL_RUN: 'manga.backfill.run',
  SETTINGS_READ: 'manga.settings.read',
  SETTINGS_WRITE: 'manga.settings.write',
} as const

export const GALGAME_DOWNLOAD_PERMISSIONS = {
  READ: 'galgame_download.read',
  SYNC_RUN: 'galgame_download.sync.run',
} as const

export const LLM_PERMISSIONS = {
  CREDENTIALS_READ: 'llm.credentials.read',
  CREDENTIALS_WRITE: 'llm.credentials.write',
  SCENES_READ: 'llm.scenes.read',
  SCENES_WRITE: 'llm.scenes.write',
  MONITORING_READ: 'llm.monitoring.read',
  TOOLS_READ: 'llm.tools.read',
  TOOLS_WRITE: 'llm.tools.write',
  TEST_RUN: 'llm.test.run',
} as const

export const DOMAIN_PERMISSION_KEYS: readonly string[] = [
  ...Object.values(GOVERNANCE_PERMISSIONS),
  ...Object.values(COMMUNITY_PERMISSIONS),
  ...Object.values(MODERATION_PERMISSIONS),
  ...Object.values(USERS_PERMISSIONS),
  ...Object.values(IDP_PERMISSIONS),
  ...Object.values(PLATFORM_PERMISSIONS),
  ...Object.values(MEDIA_PERMISSIONS),
  ...Object.values(READER_PERMISSIONS),
  ...Object.values(PROMOTIONS_PERMISSIONS),
  ...Object.values(DECORATIONS_PERMISSIONS),
  ...Object.values(SEARCH_PERMISSIONS),
  ...Object.values(TELEGRAM_PERMISSIONS),
  ...Object.values(MANGA_PERMISSIONS),
  ...Object.values(LLM_PERMISSIONS),
  ...Object.values(GALGAME_DOWNLOAD_PERMISSIONS),
]

type ValueOf<T> = T[keyof T]

export type PermissionKey =
  | typeof PERMISSION_WILDCARD
  | ValueOf<typeof WIKI_PERMISSIONS>
  | ValueOf<typeof ACCESS_PERMISSIONS>
  | ValueOf<typeof GOVERNANCE_PERMISSIONS>
  | ValueOf<typeof COMMUNITY_PERMISSIONS>
  | ValueOf<typeof MODERATION_PERMISSIONS>
  | ValueOf<typeof USERS_PERMISSIONS>
  | ValueOf<typeof IDP_PERMISSIONS>
  | ValueOf<typeof PLATFORM_PERMISSIONS>
  | ValueOf<typeof MEDIA_PERMISSIONS>
  | ValueOf<typeof READER_PERMISSIONS>
  | ValueOf<typeof PROMOTIONS_PERMISSIONS>
  | ValueOf<typeof RELEASE_NOTES_PERMISSIONS>
  | ValueOf<typeof DECORATIONS_PERMISSIONS>
  | ValueOf<typeof SEARCH_PERMISSIONS>
  | ValueOf<typeof TELEGRAM_PERMISSIONS>
  | ValueOf<typeof MANGA_PERMISSIONS>
  | ValueOf<typeof LLM_PERMISSIONS>
  | ValueOf<typeof GALGAME_DOWNLOAD_PERMISSIONS>

export type PermissionCheck = PermissionKey | `${PermissionKey}.${string}`
