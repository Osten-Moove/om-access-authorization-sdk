import { ExceptionDTO } from '@duaneoli/base-project-nest'
import { Entity, OneToMany, PrimaryColumn } from 'typeorm'
import { PolicyPermissionEntity } from './PolicyPermissionEntity'

@Entity({ name: 'permissions' })
export class PermissionEntity {
  @PrimaryColumn({ type: 'character varying', name: 'p1' })
  p1: string

  @PrimaryColumn({ type: 'character varying', name: 'p2' })
  p2: string

  @PrimaryColumn({ type: 'character varying', name: 'p3' })
  p3: string

  @PrimaryColumn({ type: 'character varying', name: 'p4' })
  p4: string

  @OneToMany(() => PolicyPermissionEntity, (policyPermissionEntity) => policyPermissionEntity.permission)
  policies?: Array<PolicyPermissionEntity>

  static StringToAuthorizationEntity(permissionString: string): PermissionEntity {
    const authStringSplit = permissionString.split(':')

    if (authStringSplit.length !== 4)
      throw ExceptionDTO.error('Invalid permission string', `The permission string must have 4 parts, separated by ":" to pass ${permissionString}`)

    const obj = new PermissionEntity()

    if (authStringSplit[0] !== '*') obj.p1 = authStringSplit[0]
    if (authStringSplit[1] !== '*') obj.p2 = authStringSplit[1]
    if (authStringSplit[2] !== '*') obj.p3 = authStringSplit[2]
    if (authStringSplit[3] !== '*') obj.p4 = authStringSplit[3]
    return obj
  }
}
