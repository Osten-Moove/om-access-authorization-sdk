import { Injectable } from '@nestjs/common'
import { GroupPolicyEntity } from '../entities/GroupPolicyEntity'
import { DefaultService } from './DefaultService'

@Injectable()
export class GroupPolicyService extends DefaultService<GroupPolicyEntity> {
  constructor() {
    super(GroupPolicyEntity)
  }
}
