import { Column, Entity, Index, OneToMany, PrimaryGeneratedColumn } from 'typeorm'
import { GroupPolicyEntity } from './GroupPolicyEntity'
import { GroupUserEntity } from './GroupUserEntity'

@Entity({ name: 'groups' })
@Index(['alias', 'owner'], { unique: true })
export class GroupEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'character varying' })
  alias: string

  @Column({ type: 'character varying' })
  description: string

  @Column({ type: 'character varying', default: 'OMP' })
  owner: string

  @OneToMany(() => GroupPolicyEntity, (policiesEntity) => policiesEntity.group, { cascade: ['insert'] })
  policies?: Array<GroupPolicyEntity>

  @OneToMany(() => GroupUserEntity, (userEntity) => userEntity.group, { cascade: ['insert'] })
  users?: Array<GroupUserEntity>

  constructor(partial: Partial<GroupEntity>) {
    Object.assign(this, partial)
  }
}
