import { ExceptionDTO } from '@duaneoli/base-project-nest'
import { AuthorizationEntity } from '../entities/AuthorizationEntity'

/**
 * Convert a AuthorizationEntity to string used in the authorization decorator
 * @param auth
 * @returns
 */
export function AuthorizationEntityToString(auth: Partial<AuthorizationEntity>) {
  return `${auth.p1 ?? '*'}:${auth.p2 ?? '*'}:${auth.p3 ?? '*'}:${auth.p4 ?? '*'}`
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

  if (authStringSplit[0] !== '*') obj.p1 = authStringSplit[0]
  if (authStringSplit[1] !== '*') obj.p2 = authStringSplit[1]
  if (authStringSplit[2] !== '*') obj.p3 = authStringSplit[2]
  if (authStringSplit[3] !== '*') obj.p4 = authStringSplit[3]
  if (userId) obj.userId = userId

  return obj
}

