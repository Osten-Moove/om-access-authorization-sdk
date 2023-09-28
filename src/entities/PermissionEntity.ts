import { ExceptionDTO } from '@duaneoli/base-project-nest'
import { Entity, OneToMany, PrimaryColumn } from 'typeorm'
import { PolicyPermissionEntity } from './PolicyPermissionEntity'

@Entity({ name: 'permissions' })
export class PermissionEntity {
  @PrimaryColumn({ type: 'character varying', name: 'microservice' })
  microservice: string

  @PrimaryColumn({ type: 'character varying', name: 'controller' })
  controller: string

  @PrimaryColumn({ type: 'character varying', name: 'router' })
  router: string

  @PrimaryColumn({ type: 'character varying', name: 'method' })
  method: 'get' | 'post' | 'put' | 'delete' | 'patch' | 'all' | 'options' | 'head' | string

  @OneToMany(() => PolicyPermissionEntity, (policyPermissionEntity) => policyPermissionEntity.permission)
  policies?: Array<PolicyPermissionEntity>

  static StringToAuthorizationEntity(permissionString: string): PermissionEntity {
    const authStringSplit = permissionString.split(':')

    if (authStringSplit.length !== 4)
      throw ExceptionDTO.error('Invalid permission string', `The permission string must have 4 parts, separated by ":" to pass ${permissionString}`)

    const obj = new PermissionEntity()

    if (authStringSplit[0] !== '*') obj.microservice = authStringSplit[0]
    if (authStringSplit[1] !== '*') obj.controller = authStringSplit[1]
    if (authStringSplit[2] !== '*') obj.router = authStringSplit[2]
    if (authStringSplit[3] !== '*') obj.method = authStringSplit[3]
    return obj
  }
}
