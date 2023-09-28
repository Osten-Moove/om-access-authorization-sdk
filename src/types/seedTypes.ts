import { DataSourceOptions } from "typeorm"

export type SeedPermissionsType = {
  [key: string]: Array<string>
}

export type SeedPolicy = {
  id: string
  alias: string
  description: string
  permissions: Array<string>
  resource: string | object
}

export type SeedPolicies = {
  [key: string]: SeedPolicy
}

export type SeedGroup = {
  id: string
  alias: string
  description: string
  policies: Array<SeedPolicy>
  users: Array<string>
}

export type SeedGroups = {
  [key: string]: SeedGroup
}

export type DefaultConfiguration = {
  dataSource: DataSourceOptions
  folder: string
  permissions: SeedPermissionsType
  policies: SeedPolicies
  groups: SeedGroups
  forceDeleteUser: Array<{ groupId: string; userId: string }>
}

export type DefaultConfigurationType = Partial<DefaultConfiguration> & { dataSource: DataSourceOptions }
