import { ExceptionDTO } from '@duaneoli/base-project-nest'
import { Logger } from '@duaneoli/logger'
import { EntityManager } from 'typeorm'
import { PermissionEntity } from '../entities/PermissionEntity'
import { PolicyEntity } from '../entities/PolicyEntity'
import { PolicyPermissionEntity } from '../entities/PolicyPermissionEntity'
import { AuthorizationLibDefaultOwner } from '../helpers/AuthorizationLibVariables'
import { compareArrays } from '../seedManager/ArrayObjectFunction'
import { generatePlanFile, readFile, writeFile } from '../seedManager/Files'
import { LoggerDetails } from '../seedManager/Logger'
import { SeedPolicies } from '../types'

export async function synchronizedPolicy(
  db: EntityManager,
  permissionHasPermissionEntities: Record<string, PermissionEntity>,
  policies: SeedPolicies,
  options: {
    folderBackup: string
    folderPlan: string
    apply: boolean
  } = {
    folderBackup: './authorization/backup',
    folderPlan: './authorization/plan',
    apply: false,
  },
) {
  const { folderBackup, folderPlan, apply } = options
  const policyHasPolicyEntities: Record<string, PolicyEntity> = Object.values(policies).reduce((acc, it) => {
    const { alias, description, resource, permissions, id } = it
    if (acc[it.alias]) throw ExceptionDTO.error('Policy duplicate declared', `Policy ${it.alias} is already defined`)
    const parseResource = typeof resource === 'string' ? resource : JSON.stringify(resource)
    acc[it.alias] = new PolicyEntity({
      id,
      alias,
      description,
      resource: parseResource,
      permissions: [],
      owner: AuthorizationLibDefaultOwner,
    })
    permissions.forEach((permission) => {
      const f = permissionHasPermissionEntities[permission]
      if (!f) throw ExceptionDTO.error('Permission not defined', `Permission ${permission} not defined in permissions`)
      else acc[it.alias].permissions.push(db.getRepository(PolicyPermissionEntity).create({ ...f, policyId: id }))
    })
    return acc
  }, {} as Record<string, PolicyEntity>)

  const policyEntities = Object.values(policyHasPolicyEntities)
  const backupEntities = readFile<PolicyEntity>(`${folderBackup}/policies.json`)

  const backupPolicyPermissionEntities = backupEntities.flatMap((it) => it.permissions.map((it) => it))
  const policyPermissionEntities = policyEntities.flatMap((it) => it.permissions.map((it) => it))
  const resultPolicyPermissions = compareArrays(policyPermissionEntities, backupPolicyPermissionEntities, (it, c) =>
    c.some(
      (itt) =>
        it.policyId === itt.policyId &&
        it.p1 === itt.p1 &&
        it.p2 === itt.p2 &&
        it.p3 === itt.p3 &&
        it.p4 === itt.p4,
    ),
  )
  LoggerDetails(
    'PolicyPermissions',
    policyPermissionEntities.length,
    backupPolicyPermissionEntities.length,
    resultPolicyPermissions,
  )

  policyEntities.forEach((it) => delete it.permissions)
  backupEntities.forEach((it) => delete it.permissions)
  const resultPolicy = compareArrays(policyEntities, backupEntities, (it, c) => c.some((cIt) => cIt.id === it.id))
  LoggerDetails('Policies', policyEntities.length, backupEntities.length, resultPolicy)

  if (apply) {
    await db.transaction(async (manager) => {
      await manager.getRepository(PolicyEntity).remove(resultPolicy.onlyInB)
      await manager.getRepository(PolicyEntity).insert(resultPolicy.onlyInA)
      await manager.getRepository(PolicyEntity).save(resultPolicy.update)
      await manager.getRepository(PolicyPermissionEntity).remove(resultPolicyPermissions.onlyInB)
      await manager.getRepository(PolicyPermissionEntity).insert(resultPolicyPermissions.onlyInA)
      await manager.getRepository(PolicyPermissionEntity).save(resultPolicyPermissions.update)
    })
    const finallyPolicyPermission = [...resultPolicyPermissions.onlyInA, ...resultPolicyPermissions.intersection]
    policyEntities.forEach((it) => (it.permissions = finallyPolicyPermission.filter((itt) => itt.policyId === it.id)))
    Logger.debug('Policy successfully synchronized')
    writeFile(`${folderBackup}/policies.json`, policyEntities)
  } else {
    writeFile(`${folderPlan}/policyPermissions.json`, generatePlanFile(resultPolicyPermissions))
    writeFile(`${folderPlan}/policies.json`, {
      add: resultPolicy.onlyInA,
      remove: resultPolicy.onlyInB,
      update: resultPolicy.update,
    })
  }

  return { policyHasPolicyEntities, update: Boolean(true) }
}
