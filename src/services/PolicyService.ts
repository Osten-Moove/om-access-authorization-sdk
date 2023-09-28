import { Injectable } from '@nestjs/common'
import { In, Repository } from 'typeorm'
import { AuthorizationEntity } from '../entities/AuthorizationEntity'
import { GroupPolicyEntity } from '../entities/GroupPolicyEntity'
import { PolicyEntity } from '../entities/PolicyEntity'
import { PolicyPermissionEntity } from '../entities/PolicyPermissionEntity'
import { AuthorizationModule } from '../module/AuthorizationModule'
import { CreatePolicies, PolicyIdentifier, PolicyPermissions, UpdatePolicies } from '../types'
import { DefaultService } from './DefaultService'

@Injectable()
export class PolicyService extends DefaultService<PolicyEntity> {
  private authorizationRepository: Repository<AuthorizationEntity>

  constructor() {
    super(PolicyEntity)
    this.authorizationRepository = AuthorizationModule.connection.getRepository(AuthorizationEntity)
  }

  /**
   * Create a new policy entity for the specified owner
   */
  async create(data: Array<CreatePolicies>, owner: string) {
    const policyEntities = this.repository.create(data.map((it) => ({ ...it, owner })))
    return this.repository.save(policyEntities)
  }

  /**
   * Update a policy entity for the specified owner
   */
  async update(data: Array<UpdatePolicies>, owner: string) {
    const policiesInDatabase = await this.repository.find({ where: data.map((it) => ({ id: it.id, owner })) })
    const policiesNotFound = data.filter((it) => !policiesInDatabase.some((itt) => it.id === itt.id))
    if (policiesNotFound && policiesNotFound.length > 0) throw Error('Some policies not found')

    policiesInDatabase.forEach((it) =>
      Object.assign(
        it,
        data.find((itt) => itt.id === it.id),
      ),
    )

    const authorizationEntities = await this.authorizationRepository.find({
      where: { policyId: In(data.map((it) => it.id)) },
    })

    authorizationEntities.forEach((it) => {
      it.resource = policiesInDatabase.find((itt) => it.policyId === itt.id).resource
    })

    return this.repository.manager.transaction(async (manager) => {
      await manager.getRepository(AuthorizationEntity).save(authorizationEntities)
      return manager.save(policiesInDatabase)
    })
  }

  /**
   * Delete a policy ids for the specified owner
   */
  async delete(policyIds: Array<PolicyIdentifier>, owner: string) {
    const policiesInDatabase = await this.repository.find({ where: policyIds.map((it) => ({ id: it, owner })) })
    const policiesNotFound = policyIds.filter((it) => !policiesInDatabase.some((itt) => it === itt.id))
    if (policiesNotFound && policiesNotFound.length > 0) throw Error('Some policies not found')

    return await this.repository.manager.transaction(async (manager) => {
      await manager.getRepository(PolicyPermissionEntity).delete({ policyId: In(policyIds) })
      await manager.getRepository(GroupPolicyEntity).delete({ policyId: In(policyIds) })
      await manager.getRepository(AuthorizationEntity).delete({ policyId: In(policyIds) })
      return manager.remove(policiesInDatabase)
    })
  }

  /**
   * Add permission for specified policy id and specified owner
   */
  async addPermissions(
    policyId: PolicyIdentifier,
    permissions: PolicyPermissions,
    owner: string,
  ): Promise<Array<PolicyPermissionEntity>> {
    if (!permissions || permissions.length == 0) throw Error('Permissions must be specified')

    const policy = await this.repository.findOneBy({ id: policyId, owner })
    if (!policy) throw Error('Policy not found')

    const authorizationEntity = await this.authorizationRepository.find({ where: { policyId: policyId } })

    const newAuthorizationEntity = Array<AuthorizationEntity>()
    authorizationEntity.forEach((it) => {
      newAuthorizationEntity.push(...permissions.map((itt) => ({ ...it, ...itt })))
    })

    return await this.repository.manager.transaction(async (manager) => {
      await manager.getRepository(AuthorizationEntity).insert(authorizationEntity)
      return manager
        .getRepository(PolicyPermissionEntity)
        .save(permissions.map((it) => ({ policyId: policyId, ...it })))
    })
  }

  /**
   * Delete permission for specified policy id and specified owner
   */
  async deletePermissions(policyId: string, permissions: PolicyPermissions, owner: string) {
    const policy = await this.repository.findOneBy({ id: policyId, owner })
    if (!policy) throw Error('Policy not found')

    const authorizationEntity = await this.authorizationRepository.find({ where: { policyId: policyId } })

    const newAuthorizationEntity = Array<AuthorizationEntity>()
    authorizationEntity.forEach((it) => {
      newAuthorizationEntity.push(...permissions.map((itt) => ({ ...it, ...itt })))
    })

    return await this.repository.manager.transaction(async (manager) => {
      await manager.getRepository(AuthorizationEntity).remove(authorizationEntity)
      return manager
        .getRepository(PolicyPermissionEntity)
        .remove(permissions.map((it) => ({ policyId: policyId, ...it })))
    })
  }
}
