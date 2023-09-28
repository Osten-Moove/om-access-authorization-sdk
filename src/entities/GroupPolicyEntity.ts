import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm'
import { GroupEntity } from './GroupEntity'
import { PolicyEntity } from './PolicyEntity'

@Entity({ name: 'group_policies' })
export class GroupPolicyEntity {
  @PrimaryColumn({ type: 'uuid', name: 'group_id' })
  groupId: string

  @PrimaryColumn({ type: 'uuid', name: 'policy_id' })
  policyId: string

  @ManyToOne(() => GroupEntity)
  @JoinColumn({ name: 'group_id' })
  group?: GroupEntity

  @ManyToOne(() => PolicyEntity)
  @JoinColumn({ name: 'policy_id' })
  policy?: PolicyEntity
}
