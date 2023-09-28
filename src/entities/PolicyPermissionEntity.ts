import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm'
import { PermissionEntity } from './PermissionEntity'
import { PolicyEntity } from './PolicyEntity'

@Entity({ name: 'policy_permissions' })
export class PolicyPermissionEntity {
  @PrimaryColumn({ type: 'character varying', name: 'policy_id' })
  policyId: string

  @PrimaryColumn({ type: 'character varying', name: 'microservice' })
  microservice: string

  @PrimaryColumn({ type: 'character varying', name: 'controller' })
  controller: string

  @PrimaryColumn({ type: 'character varying', name: 'router' })
  router: string

  @PrimaryColumn({ type: 'character varying', name: 'method' })
  method: 'get' | 'post' | 'put' | 'delete' | 'patch' | 'all' | 'options' | 'head' | string

  @ManyToOne(() => PolicyEntity)
  @JoinColumn({ name: 'policy_id' })
  policy?: PolicyEntity

  @ManyToOne(() => PermissionEntity)
  @JoinColumn([
    { name: 'microservice', referencedColumnName: 'microservice' },
    { name: 'controller', referencedColumnName: 'controller' },
    { name: 'router', referencedColumnName: 'router' },
    { name: 'method', referencedColumnName: 'method' },
  ])
  permission?: PermissionEntity
}
