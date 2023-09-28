import { Column, Entity, Index, OneToMany, PrimaryGeneratedColumn } from 'typeorm'
import { GroupPolicyEntity } from './GroupPolicyEntity'
import { PolicyPermissionEntity } from './PolicyPermissionEntity'

@Entity({ name: 'policies' })
@Index(['alias', 'owner'], { unique: true })
export class PolicyEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'character varying' })
  alias: string

  @Column({ type: 'character varying' })
  description: string

  @Column({ type: 'text', default: '*' })
  resource: string

  @Column({ type: 'character varying' })
  owner: string

  @OneToMany(() => PolicyPermissionEntity, (policyPermissionEntity) => policyPermissionEntity.policy, {
    cascade: ['insert'],
  })
  permissions?: Array<PolicyPermissionEntity>

  @OneToMany(() => GroupPolicyEntity, (policiesEntity) => policiesEntity.policy)
  groups?: Array<GroupPolicyEntity>

  constructor(partial?: Partial<PolicyEntity>) {
    Object.assign(this, partial)
  }
}
