import { Logger } from '@duaneoli/logger'
import { DataSource } from 'typeorm'
import { GroupUserEntity } from '../entities/GroupUserEntity'
import { synchronizedAuthorizations } from '../seedManager/SynchronizedAuthorizations'
import { synchronizedGroup } from '../seedManager/SynchronizedGroup'
import { synchronizedPermission } from '../seedManager/SynchronizedPermission'
import { synchronizedPolicy } from '../seedManager/SynchronizedPolicy'
import { DefaultConfiguration, typeArgs } from '../types/types'
import { createDirectory } from './Files'

export async function SeedRun(config: DefaultConfiguration, args?: typeArgs) {
  if (!config.dataSource) return
  const db = new DataSource(config.dataSource)
  const apply = Boolean(args?.apply)
  const refresh = Boolean(args?.refresh)

  const { folderBackup, folderPlan } = createDirectory(config.folder, apply)
  await db.initialize()
  try {
    let refreshAuthorization = false
    let groupUserForRemove: Array<GroupUserEntity> = []
    const options = { apply: apply, folderBackup, folderPlan }
    if (!refresh) {
      refreshAuthorization = await db.transaction(async (manager) => {
        const permission = await synchronizedPermission(manager, config.permissions, options)
        const policy = await synchronizedPolicy(
          manager,
          permission.permissionHasPermissionEntities,
          config.policies,
          options,
        )
        groupUserForRemove = await synchronizedGroup(manager, policy.policyHasPolicyEntities, config.groups, options)
        manager.getRepository(GroupUserEntity)
        return permission.update || policy.update || groupUserForRemove.length > 0
      })
    }
    await db.transaction(async (manager) => {
      await synchronizedAuthorizations(manager, {
        ...options,
        forceDeleteUser: [...groupUserForRemove, ...config.forceDeleteUser],
      })
    })
  } catch (error) {
    Logger.error(error)
  }
  await db.destroy()
  return
}
