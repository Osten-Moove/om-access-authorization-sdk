export type Permission = {
  p1: string
  p2: string
  p3: string
  p4: string
}

export type Policy = {
  id: string
  alias: string
  description: string
  resource: string
}

export type PolicyIdentifier = Policy['id']

export type PolicyPermissions = Array<Permission>

export type CreatePolicies = Omit<Policy, 'id'> & {
  permissions: PolicyPermissions
}

export type UpdatePolicies = Partial<Policy> & {
  id: string
}

export type Group = {
  id: string
  alias: string
  description: string
}

export type GroupIdentifier = Group['id']

export type GroupPolicies = Array<{ policyId: string }>

export type GroupUsers = Array<{ userId: string }>

export type CreateGroups = Omit<Group, 'id'> & {
  id?: string
  policies: GroupPolicies
  users: GroupUsers
}

export type UpdateGroups = Partial<Group> & {
  id: string
}
