import { AuthorizationEntity } from '../entities'

export type PermissionResourceDTO = {
  permission: string
  resource: string
}

export type PermissionResourceAuthorizationDTO = PermissionResourceDTO & {
  authorized: boolean
}

export type FilteredAllowedResourcesDTO<T> = {
  allowed: T[]
  refused: T[]
}

export type AuthorizationPayloadDTO = {
  authorizationPayloadDTO: AuthorizationEntity[]
}

export type ValidArgs = 'apply' | 'refresh' | 'config'
export type typeArgs = { [k in ValidArgs]?: string }
