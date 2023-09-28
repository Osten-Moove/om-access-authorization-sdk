import { ExceptionDTO } from '@duaneoli/base-project-nest'
import { Logger } from '@duaneoli/logger'
import { EntityManager } from 'typeorm'
import { GroupEntity } from '../entities/GroupEntity'
import { GroupPolicyEntity } from '../entities/GroupPolicyEntity'
import { GroupUserEntity } from '../entities/GroupUserEntity'
import { PolicyEntity } from '../entities/PolicyEntity'
import { AuthorizationLibDefaultOwner } from '../helpers/AuthorizationLibVariables'
import { compareArrays } from '../seedManager/ArrayObjectFunction'
import { generatePlanFile, readFile, writeFile } from '../seedManager/Files'
import { LoggerDetails } from '../seedManager/Logger'
import { SeedGroups } from '../types'

export async function synchronizedGroup(
  db: EntityManager,
  policyHasPolicyEntities: Record<string, PolicyEntity>,
  groups: SeedGroups,
  options: {
    folderBackup: string
    folderPlan: string
    apply: boolean
  } = {
    folderBackup: './authorization/backup',
    folderPlan: './authorization/plan',
    apply: false,
  },
): Promise<Array<GroupUserEntity>> {
  const { folderBackup, folderPlan, apply } = options
  const groupHasPolicyEntities: Record<string, GroupEntity> = Object.values(groups).reduce((acc, it) => {
    const { alias, description, policies, id, users } = it
    if (acc[it.alias]) throw ExceptionDTO.error('Group dupicate declared', `Group ${it.alias} is already defined`)
    acc[it.alias] = new GroupEntity({
      id,
      alias,
      description,
      policies: [],
      users: [],
      owner: AuthorizationLibDefaultOwner,
    })
    policies.forEach((policy) => {
      const f = policyHasPolicyEntities[policy.alias]
      if (!f) throw ExceptionDTO.error('Policy not defined', `Policy ${policy.alias} not defined in policies`)
      else acc[it.alias].policies.push({ policyId: policy.id, groupId: id } as GroupPolicyEntity)
    })
    users.forEach((user) => {
      acc[it.alias].users.push({ userId: user, groupId: id } as GroupUserEntity)
    })
    return acc
  }, {} as Record<string, GroupEntity>)

  const groupEntities = Object.values(groupHasPolicyEntities)
  const backupEntities = readFile<GroupEntity>(`${folderBackup}/groups.json`)

  const backupGroupPolicyEntities = backupEntities.flatMap((it) => it.policies.map((it) => it))
  const groupPolicyEntities = groupEntities.flatMap((it) => it.policies.map((it) => it))
  const resultGroupPolicies = compareArrays(groupPolicyEntities, backupGroupPolicyEntities, (it, c) =>
    c.some((itt) => it.groupId === itt.groupId && it.policyId === itt.policyId),
  )
  LoggerDetails('GroupPolicies', groupPolicyEntities.length, backupGroupPolicyEntities.length, resultGroupPolicies)

  const backupGroupUserEntities = backupEntities.flatMap((it) => it.users.map((it) => it))
  const groupUserEntities = groupEntities.flatMap((it) => it.users.map((it) => it))
  const resultGroupUsers = compareArrays(groupUserEntities, backupGroupUserEntities, (it, c) =>
    c.some((itt) => it.groupId === itt.groupId && it.userId === itt.userId),
  )
  LoggerDetails('GroupUsers', groupPolicyEntities.length, backupGroupPolicyEntities.length, resultGroupUsers)

  groupEntities.forEach((it) => {
    delete it.policies
    delete it.users
  })
  backupEntities.forEach((it) => {
    delete it.policies
    delete it.users
  })
  const resultGroup = compareArrays(groupEntities, backupEntities, (it, c) => c.some((cIt) => cIt.id === it.id))
  LoggerDetails('Groups', groupEntities.length, backupEntities.length, resultGroup)

  if (apply) {
    await db.transaction(async (manager) => {
      await manager.getRepository(GroupEntity).remove(resultGroup.onlyInB)
      await manager.getRepository(GroupEntity).insert(resultGroup.onlyInA)
      await manager.getRepository(GroupEntity).save(resultGroup.update)
      await manager.getRepository(GroupPolicyEntity).remove(resultGroupPolicies.onlyInB)
      await manager.getRepository(GroupPolicyEntity).insert(resultGroupPolicies.onlyInA)
      await manager.getRepository(GroupPolicyEntity).save(resultGroupPolicies.update)
      await manager.getRepository(GroupUserEntity).remove(resultGroupUsers.onlyInB)
      await manager.getRepository(GroupUserEntity).insert(resultGroupUsers.onlyInA)
      await manager.getRepository(GroupUserEntity).save(resultGroupUsers.update)
    })
    const finallyGroupPolicies = [...resultGroupPolicies.onlyInA, ...resultGroupPolicies.intersection]
    const finallyGroupUsers = [...resultGroupUsers.onlyInA, ...resultGroupUsers.intersection]
    groupEntities.forEach((it) => {
      it.policies = finallyGroupPolicies.filter((itt) => itt.groupId === it.id)
      it.users = finallyGroupUsers.filter((itt) => itt.groupId === it.id)
    })
    Logger.debug('Groups successfully synchronized')
    writeFile(`${folderBackup}/groups.json`, groupEntities)
  } else {
    writeFile(`${folderPlan}/groupPolicies.json`, generatePlanFile(resultGroupPolicies))
    writeFile(`${folderPlan}/groupUsers.json`, generatePlanFile(resultGroupUsers))
    writeFile(`${folderPlan}/groups.json`, generatePlanFile(resultGroup))
  }
  return resultGroupUsers.onlyInB
}
