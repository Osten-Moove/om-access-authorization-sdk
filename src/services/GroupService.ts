import { Injectable } from '@nestjs/common'
import { In, Repository } from 'typeorm'
import { v4 } from 'uuid'
import { AuthorizationEntity } from '../entities/AuthorizationEntity'
import { GroupEntity } from '../entities/GroupEntity'
import { GroupPolicyEntity } from '../entities/GroupPolicyEntity'
import { GroupUserEntity } from '../entities/GroupUserEntity'
import { PolicyEntity } from '../entities/PolicyEntity'
import { AuthorizationModule } from '../module/AuthorizationModule'
import { CreateGroups, GroupIdentifier, UpdateGroups } from '../types'
import { DefaultService } from './DefaultService'

@Injectable()
export class GroupService extends DefaultService<GroupEntity> {
  private authorizationRepository: Repository<AuthorizationEntity>
  private policyRepository: Repository<PolicyEntity>

  constructor() {
    super(GroupEntity)
    this.authorizationRepository = AuthorizationModule.connection.getRepository(AuthorizationEntity)
    this.policyRepository = AuthorizationModule.connection.getRepository(PolicyEntity)
  }

  private generateAuthorizationByGroup(group: GroupEntity) {
    const authorizationWithoutUsers = Array<AuthorizationEntity>()
    group.policies.forEach((groupPolicy) => {
      authorizationWithoutUsers.push(
        ...groupPolicy.policy.permissions.map((permission) =>
          this.authorizationRepository.create({
            groupId: group.id,
            policyId: groupPolicy.policy.id,
            resource: groupPolicy.policy.resource,
            p1: permission.p1,
            p2: permission.p2,
            p3: permission.p3,
            p4: permission.p4,
          }),
        ),
      )
    })
    return group.users.reduce((acc, user) => {
      acc.push(...authorizationWithoutUsers.map((it) => ({ ...it, userId: user.userId })))
      return acc
    }, [])
  }

  /**
   * Create a new group entity for the specified owner
   */
  async create(data: Array<CreateGroups>, owner: string) {
    const alias = data.map((it) => ({ alias: it.alias, owner }))
    const ids = data.filter((it) => it.id).map((it) => ({ id: it.id }))
    const groupInDatabase = await this.repository.find({ where: [...alias, ...ids] })
    if (groupInDatabase && groupInDatabase.length > 0) throw Error('Somes groups already in database')

    const groupEntities = this.repository.create(data.map((it) => ({ ...it, owner, id: it.id ? it.id : v4() })))
    const groupWithUsers = groupEntities.filter((it) => it.users.length > 0)
    const groupWithoutUsers = groupEntities.filter((it) => it.users.length === 0 || !it.users)

    const policyIdsWithUsers = [...new Set(groupWithUsers.flatMap((it) => it.policies.map((it) => it.policyId)))]
    const policyIdsWithoutUsers = [...new Set(groupWithoutUsers.flatMap((it) => it.policies.map((it) => it.policyId)))]

    const policyEntitiesWithPermissions = await this.policyRepository.find({
      where: { id: In(policyIdsWithUsers), owner },
      relations: ['permissions'],
    })
    if (policyEntitiesWithPermissions.length !== policyIdsWithUsers.length) throw Error('Some policies not found')

    if (policyIdsWithoutUsers && policyIdsWithoutUsers.length > 0) {
      const policyEntitiesWithoutPermissions = await this.policyRepository.find({
        where: { id: In(policyIdsWithoutUsers), owner },
      })
      if (policyEntitiesWithoutPermissions.length !== policyIdsWithoutUsers.length)
        throw Error('Some policies not found')
    }

    const authorizationEntities = Array<AuthorizationEntity>()
    groupWithUsers.forEach((group) => {
      const completedGroup = { ...group }
      completedGroup.policies.forEach((groupPolicy) => {
        groupPolicy.policy = policyEntitiesWithPermissions.find((it) => it.id === groupPolicy.policyId)
      })
      authorizationEntities.push(...this.generateAuthorizationByGroup(completedGroup))
    })

    return this.repository.manager.transaction(async (manager) => {
      await manager.getRepository(AuthorizationEntity).insert(authorizationEntities)
      return manager.save(groupEntities)
    })
  }

  /**
   * Update a group for the specified owner
   */
  async update(data: Array<UpdateGroups>, owner: string) {
    const groupInDatabase = await this.repository.find({ where: { id: In(data.map((it) => it.id)), owner } })
    if (groupInDatabase.length !== data.length) throw Error('Some groups not found')

    groupInDatabase.forEach((group) =>
      Object.assign(
        group,
        data.find((it) => group.id === it.id),
      ),
    )

    return this.repository.save(groupInDatabase)
  }

  /**
   * Delete a group for the specified owner
   */
  async delete(data: Array<GroupIdentifier>, owner: string) {
    const groupInDatabase = await this.repository.find({ where: { id: In(data), owner } })
    if (groupInDatabase.length !== data.length) throw Error('Some groups not found')

    return this.repository.manager.transaction(async (manager) => {
      const groupId = groupInDatabase.map((it) => it.id)
      await manager.getRepository(AuthorizationEntity).delete({ groupId: In(groupId) })
      await manager.getRepository(GroupPolicyEntity).delete({ groupId: In(groupId) })
      await manager.getRepository(GroupUserEntity).delete({ groupId: In(groupId) })
      return manager.remove(groupInDatabase)
    })
  }

  /**
   * Add users in group for the specified owner
   */
  async addUsers(groupId: string, userIds: Array<string>, owner: string) {
    const groupEntity = await this.repository.findOne({
      where: { id: groupId, owner },
      relations: ['policies', 'policies.policy', 'policies.policy.permissions'],
    })
    if (!groupEntity) throw Error('Group not found')

    const groupUserEntities = userIds.map((it) => ({ groupId: groupId, userId: it }))
    const authorizationEntity = this.generateAuthorizationByGroup({ ...groupEntity, users: groupUserEntities })

    return this.repository.manager.transaction(async (manager) => {
      await manager.getRepository(AuthorizationEntity).insert(authorizationEntity)
      return manager.getRepository(GroupUserEntity).save(groupUserEntities)
    })
  }

  /**
   * Remove users in group for the specified owner
   */
  async removeUser(groupId: string, userIds: Array<string>, owner: string) {
    const groupEntity = await this.repository.findOne({ where: { id: groupId, owner } })
    if (!groupEntity) throw Error('Group not found')

    return this.repository.manager.transaction(async (manager) => {
      await manager.getRepository(AuthorizationEntity).delete({ groupId: groupId, userId: In(userIds) })
      return manager.getRepository(GroupUserEntity).delete({ groupId: groupId, userId: In(userIds) })
    })
  }

  /**
   * Add policies in group for the specified owner
   */
  async addPolicies(groupId: string, policyIds: Array<string>, owner: string) {
    const groupEntity = await this.repository.findOne({ where: { id: groupId, owner }, relations: ['users'] })
    if (!groupEntity) throw Error('Group not found')

    const policyEntities = await this.policyRepository.find({ where: { id: In(policyIds) }, relations: ['permissions'] })
    if (policyEntities.length !== policyIds.length) throw Error('Some policies not found')

    groupEntity.policies = policyEntities.map((it) => ({ groupId: groupId, policyId: it.id, policy: it }))

    const authorizationEntities = this.generateAuthorizationByGroup(groupEntity)

    return this.repository.manager.transaction(async (manager) => {
      await manager.getRepository(AuthorizationEntity).insert(authorizationEntities)
      return manager.getRepository(GroupPolicyEntity).save(groupEntity.policies)
    })
  }

  /**
   * Remove policies in group for the specified owner
   */
  async removePolicy(groupId: string, policyIds: Array<string>, owner: string) {
    const groupEntity = await this.repository.findOne({ where: { id: groupId, owner } })
    if (!groupEntity) throw Error('Group not found')

    return this.repository.manager.transaction(async (manager) => {
      await manager.getRepository(AuthorizationEntity).delete({ groupId: groupId, policyId: In(policyIds) })
      return manager.getRepository(GroupPolicyEntity).delete({ groupId: groupId, policyId: In(policyIds) })
    })
  }
}
