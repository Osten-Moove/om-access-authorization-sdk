import { Logger } from '@duaneoli/logger'
import { EntityManager, In } from 'typeorm'
import { AuthorizationEntity } from '../entities/AuthorizationEntity'
import { GroupEntity } from '../entities/GroupEntity'
import { GroupUserEntity } from '../entities/GroupUserEntity'
import { PolicyEntity } from '../entities/PolicyEntity'
import { compareArrays } from '../seedManager/ArrayObjectFunction'
import { generatePlanFile, readFile, writeFile } from '../seedManager/Files'

export async function synchronizedAuthorizations(
  db: EntityManager,
  options: {
    folderBackup: string
    folderPlan: string
    apply: boolean
    forceDeleteUser?: Array<GroupUserEntity>
  },
) {
  const { folderBackup, folderPlan, apply, forceDeleteUser } = options
  Logger.info('Inicializing refresh for authorization')
  const resultFinish = { onlyInA: [], onlyInB: [], update: [], intersection: [] }

  const groupBackupEntities = readFile<GroupEntity>(`${folderBackup}/groups.json`)
  const policyBackupEntities = readFile<PolicyEntity>(`${folderBackup}/policies.json`)

  const groupUsers = await db
    .getRepository(GroupUserEntity)
    .find({ where: { groupId: In(groupBackupEntities.map((it) => it.id)) } })
  const groupIdHaveUserIds: Record<string, Array<string>> = groupUsers.reduce((acc, groupUser) => {
    if (!acc[groupUser.groupId]) acc[groupUser.groupId] = [groupUser.userId]
    else acc[groupUser.groupId].push(groupUser.userId)
    return acc
  }, {} as Record<string, Array<string>>)

  const groupIdHaveUserIdsForDelete = forceDeleteUser
    ? forceDeleteUser.reduce((acc, groupUser) => {
        if (!acc[groupUser.groupId]) acc[groupUser.groupId] = [groupUser.userId]
        else acc[groupUser.groupId].push(groupUser.userId)
        return acc
      }, {} as Record<string, Array<string>>)
    : undefined

  const groupIds = Object.keys(groupIdHaveUserIds)
  const groupPolicies = groupBackupEntities.flatMap((groupEntity) =>
    groupEntity.policies.filter((it) => groupIds.includes(it.groupId)),
  )
  const authorizationsEntities = Array<AuthorizationEntity>()
  Object.entries(groupIdHaveUserIds).forEach(([groupId, userIds]) => {
    const haveUserForDelete = groupIdHaveUserIdsForDelete ? groupIdHaveUserIdsForDelete[groupId] : []
    const groupPolicyIds = [...new Set(groupPolicies.map((it) => it.policyId))]
    const policies = policyBackupEntities.filter((it) => groupPolicyIds.includes(it.id))
    const authorizationsWithOutUserId = Array<AuthorizationEntity>()
    policies.forEach((policy) => {
      const { id, resource, permissions: policyPermissions } = policy
      policyPermissions.forEach((policyPermission) => {
        const { microservice, controller, router, method } = policyPermission
        authorizationsWithOutUserId.push(
          db.getRepository(AuthorizationEntity).create({
            groupId,
            policyId: id,
            resource,
            microservice,
            controller,
            router,
            method,
          }),
        )
      })
    })
    authorizationsEntities.push(
      ...userIds.flatMap((userId) => authorizationsWithOutUserId.map((it) => ({ ...it, userId }))),
    )
    if (haveUserForDelete && haveUserForDelete.length > 0)
      resultFinish.onlyInB.push(
        ...haveUserForDelete.flatMap((userId) => authorizationsWithOutUserId.map((it) => ({ ...it, userId }))),
      )
  })
  const take = 10
  const totalPages = (((authorizationsEntities.length - 1) / take) ^ 0) + 1
  Logger.info(`Have ${authorizationsEntities.length} for processing in total pages ${totalPages}`)

  for (let page = 0; page < totalPages; page++) {
    const authorizationEntitiesTake = authorizationsEntities.slice(page * take, page * take + take)
    const withOutResource = authorizationEntitiesTake.map(({ resource, ...it }) => it)
    const authorizationEntitiesInDatabase = await db.getRepository(AuthorizationEntity).find({ where: withOutResource })
    const result = compareArrays(authorizationEntitiesTake, authorizationEntitiesInDatabase, (it, c) =>
      c.some(
        (itt) =>
          itt.groupId === it.groupId &&
          itt.userId === it.userId &&
          itt.policyId === it.policyId &&
          itt.microservice === it.microservice &&
          itt.controller === it.controller &&
          itt.router === it.router &&
          itt.method === it.method,
      ),
    )
    resultFinish.onlyInA.push(...result.onlyInA)
    resultFinish.onlyInB.push(...result.onlyInB)
    resultFinish.update.push(...result.update)
    resultFinish.intersection.push(...result.intersection)
  }

  if (apply) {
    await db.transaction(async () => {
      await db.getRepository(AuthorizationEntity).remove(resultFinish.onlyInB)
      await db.getRepository(AuthorizationEntity).insert(resultFinish.onlyInA)
      await db.getRepository(AuthorizationEntity).save(resultFinish.update, { chunk: 10 })
    })
  } else {
    writeFile(`${folderPlan}/authorization.json`, generatePlanFile(resultFinish))
  }
}
