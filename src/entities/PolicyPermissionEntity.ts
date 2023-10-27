import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm'
import { PermissionEntity } from './PermissionEntity'
import { PolicyEntity } from './PolicyEntity'

@Entity({ name: 'policy_permissions' })
export class PolicyPermissionEntity {
  @PrimaryColumn({ type: 'character varying', name: 'policy_id' })
  policyId: string

  @PrimaryColumn({ type: 'character varying', name: 'p1' })
  p1: string

  @PrimaryColumn({ type: 'character varying', name: 'p2' })
  p2: string

  @PrimaryColumn({ type: 'character varying', name: 'p3' })
  p3: string

  @PrimaryColumn({ type: 'character varying', name: 'p4' })
  p4: string

  @ManyToOne(() => PolicyEntity)
  @JoinColumn({ name: 'policy_id' })
  policy?: PolicyEntity

  @ManyToOne(() => PermissionEntity)
  @JoinColumn([
    { name: 'p1', referencedColumnName: 'p1' },
    { name: 'p2', referencedColumnName: 'p2' },
    { name: 'p3', referencedColumnName: 'p3' },
    { name: 'p4', referencedColumnName: 'p4' },
  ])
  permission?: PermissionEntity
}
