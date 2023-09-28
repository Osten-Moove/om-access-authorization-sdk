import { Column, Entity, PrimaryColumn } from 'typeorm'

@Entity({ name: 'authorization' })
export class AuthorizationEntity {
  @PrimaryColumn({ type: 'uuid', name: 'group_id' })
  groupId: string

  @PrimaryColumn({ type: 'uuid', name: 'user_id' })
  userId: string

  @PrimaryColumn({ type: 'uuid', name: 'policy_id' })
  policyId: string

  @PrimaryColumn({ type: 'character varying', name: 'microservice' })
  microservice: string

  @PrimaryColumn({ type: 'character varying', name: 'controller' })
  controller: string

  @PrimaryColumn({ type: 'character varying', name: 'router' })
  router: string

  @PrimaryColumn({ type: 'character varying', name: 'method' })
  method: 'get' | 'post' | 'put' | 'delete' | 'patch' | 'all' | 'options' | 'head' | string

  @Column({ type: 'text' })
  resource: string
}
