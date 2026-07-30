import type { ApiData } from '@hikarinagi/api-contract/v3'

export type BackendPermissionCatalog = ApiData<'/api/v3/permissions/catalog', 'get'>
export type BackendPermissionCatalogEntry = BackendPermissionCatalog['permissions'][number]
export type BackendPermissionGroupList = ApiData<'/api/v3/permission-groups', 'get'>
export type BackendPermissionGroup = ApiData<'/api/v3/permission-groups/{id}', 'get'>
export type BackendPermissionGroupMemberList = ApiData<
  '/api/v3/permission-groups/{id}/members',
  'get'
>
