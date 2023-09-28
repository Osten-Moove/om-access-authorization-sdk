import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm'
import { GroupEntity } from './GroupEntity'

@Entity({ name: 'group_users' })
export class GroupUserEntity {
  @PrimaryColumn({ type: 'uuid', name: 'group_id' })
  groupId: string

  @PrimaryColumn({ type: 'uuid', name: 'user' })
  userId: string

  @ManyToOne(() => GroupEntity)
  @JoinColumn({ name: 'group_id' })
  group?: GroupEntity
}
