import { DataSourceOptions } from 'typeorm'
import { GroupEntity } from '../src/entities/GroupEntity'
import { GroupPolicyEntity } from '../src/entities/GroupPolicyEntity'
import { GroupUserEntity } from '../src/entities/GroupUserEntity'
import { PermissionEntity } from '../src/entities/PermissionEntity'
import { PolicyEntity } from '../src/entities/PolicyEntity'
import { PolicyPermissionEntity } from '../src/entities/PolicyPermissionEntity'
import { SeedRun } from '../src/seedManager'
import { SeedGroups, SeedPermissionsType, SeedPolicies } from '../src/types'

const Permissions: SeedPermissionsType = {
  PERMISSION_LIST: ['authorization:permission:/:get'],
  PERMISSION_GET_MICROSERVICES: ['authorization:permission:/microservices:get'],
}

const Policies: SeedPolicies = {
  PERMISSION_ALL: {
    id: 'e5632029-c20b-531f-b163-5d2c2801dc7d',
    alias: 'Permissions Full Access',
    description: 'Manager all permissions',
    permissions: [...Permissions.PERMISSION_LIST, ...Permissions.PERMISSION_GET_MICROSERVICES],
    resource: '*',
  },
}

export const Groups: SeedGroups = {
  FULL_ACCESS: {
    id: '5ea7f2d8-f3d3-5ddf-9481-f15ffc260b55',
    alias: 'Full access',
    description: 'Full access in all system and resources',
    policies: [Policies.PERMISSION_ALL],
    users: ['ef9cbf50-0ff2-40fa-bc9d-901e6a5a170a'],
  },
}

export const DatabaseConfig: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [PermissionEntity, PolicyPermissionEntity, PolicyEntity, GroupUserEntity, GroupEntity, GroupPolicyEntity],
  logging: process.env.DB_DEBUG ? true : false,
  name: 'AUTHORIZATION_OSTEN_MOOVE',
}

async function run() {
  await SeedRun({
    dataSource: DatabaseConfig,
    permissions: Permissions,
    policies: Policies,
    groups: Groups,
    forceDeleteUser: [],
    folder: './src/authorization',
  })
}

run()
