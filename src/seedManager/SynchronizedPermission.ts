import { ExceptionDTO } from '@duaneoli/base-project-nest'
import { Logger } from '@duaneoli/logger'
import { EntityManager } from 'typeorm'
import { PermissionEntity } from '../entities/PermissionEntity'
import { compareArrays } from '../seedManager/ArrayObjectFunction'
import { readFile, writeFile } from '../seedManager/Files'
import { LoggerDetails } from '../seedManager/Logger'
import { SeedPermissionsType } from '../types'

export async function synchronizedPermission(
  db: EntityManager,
  permissions: SeedPermissionsType,
  options: {
    folderBackup: string
    folderPlan: string
    apply: boolean
  },
): Promise<{ permissionHasPermissionEntities: Record<string, PermissionEntity>; update: boolean }> {
  const { folderBackup, folderPlan, apply } = options
  const permissionHasPermissionEntities: Record<string, PermissionEntity> = Object.values(permissions).reduce(
    (acc, it) => {
      it.forEach((permission) => {
        if (acc[permission])
          throw ExceptionDTO.error('Permission duplicate declared', `Permission ${permission} is already defined`)
        acc[permission] = PermissionEntity.StringToAuthorizationEntity(permission)
      })
      return acc
    },
    {},
  )

  const permissionEntities = Object.values(permissionHasPermissionEntities)
  const backupEntities = readFile<PermissionEntity>(`${folderBackup}/permissions.json`)

  const result = compareArrays(permissionEntities, backupEntities, (it, c) =>
    c.some(
      (cIt) =>
        cIt.p2 === it.p2 &&
        cIt.p1 === it.p1 &&
        cIt.p3 === it.p3 &&
        cIt.p4 === it.p4,
    ),
  )
  LoggerDetails('Permissions', permissionEntities.length, backupEntities.length, result)
  if (apply) {
    await db.transaction(async (manager) => {
      await manager.getRepository(PermissionEntity).remove(result.onlyInB)
      await manager.getRepository(PermissionEntity).insert(result.onlyInA)
    })
    Logger.debug('Permission successfully synchronized')
    writeFile(`${folderBackup}/permissions.json`, permissionEntities)
  } else {
    writeFile(`${folderPlan}/permissions.json`, { add: result.onlyInA, remove: result.onlyInB })
  }
  return { permissionHasPermissionEntities, update: Boolean(result.onlyInB.length || result.onlyInA.length) }
}
