import { ExceptionDTO } from '@duaneoli/base-project-nest'
import { AuthorizationEntity } from '../entities/AuthorizationEntity'

/**
 * Convert a AuthorizationEntity to string used in the authorization decorator
 * @param auth
 * @returns
 */
export function AuthorizationEntityToString(auth: Partial<AuthorizationEntity>) {
  return `${auth.microservice ?? '*'}:${auth.controller ?? '*'}:${auth.router ?? '*'}:${auth.method ?? '*'}`
}

/**
 * Convert a string used in the authorization decorator to AuthorizationEntity
 * @param authString
 * @param userId id of the user, optional
 * @returns
 */
export function StringToAuthorizationEntity(authString: string, userId: string = undefined) {
  const authStringSplit = authString.split(':')

  if (authStringSplit.length !== 4)
    throw ExceptionDTO.error(
      'Invalid authorization string',
      'The authorization string must have 4 parts, separated by ":"',
    )

  const obj: Partial<AuthorizationEntity> = {}

  if (authStringSplit[0] !== '*') obj.microservice = authStringSplit[0]
  if (authStringSplit[1] !== '*') obj.controller = authStringSplit[1]
  if (authStringSplit[2] !== '*') obj.router = authStringSplit[2]
  if (authStringSplit[3] !== '*') obj.method = authStringSplit[3]
  if (userId) obj.userId = userId

  return obj
}

