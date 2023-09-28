import { Inject, Injectable } from '@nestjs/common'
import { GroupPolicyService } from './GroupPolicyService'
import { GroupService } from './GroupService'
import { GroupUserService } from './GroupUserService'
import { PermissionService } from './PermissionService'
import { PolicyPermissionService } from './PolicyPermissionService'
import { PolicyService } from './PolicyService'
import { UserService } from './UserService'

@Injectable()
export class ControlService {
  constructor(
    @Inject(GroupPolicyService) readonly groupPolicy: GroupPolicyService,
    @Inject(GroupService) readonly group: GroupService,
    @Inject(GroupUserService) readonly groupUser: GroupUserService,
    @Inject(PermissionService) readonly permission: PermissionService,
    @Inject(PolicyPermissionService) readonly policyPermission: PolicyPermissionService,
    @Inject(PolicyService) readonly policy: PolicyService,
    @Inject(UserService) readonly user: UserService,
  ) {}
}
