import { Column, Entity, PrimaryColumn } from 'typeorm'

@Entity({ name: 'authorization' })
export class AuthorizationEntity {
  @PrimaryColumn({ type: 'uuid', name: 'group_id' })
  groupId: string

  @PrimaryColumn({ type: 'uuid', name: 'user_id' })
  userId: string

  @PrimaryColumn({ type: 'uuid', name: 'policy_id' })
  policyId: string

  @PrimaryColumn({ type: 'character varying', name: 'p1' })
  p1: string

  @PrimaryColumn({ type: 'character varying', name: 'p2' })
  p2: string

  @PrimaryColumn({ type: 'character varying', name: 'p3' })
  p3: string

  @PrimaryColumn({ type: 'character varying', name: 'p4' })
  p4: string

  @Column({ type: 'text' })
  resource: string
}
