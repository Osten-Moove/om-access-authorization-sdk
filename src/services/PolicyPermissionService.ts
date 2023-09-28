import { Injectable } from '@nestjs/common'
import { PolicyPermissionEntity } from '../entities/PolicyPermissionEntity'
import { DefaultService } from './DefaultService'

@Injectable()
export class PolicyPermissionService extends DefaultService<PolicyPermissionEntity> {
  constructor() {
    super(PolicyPermissionEntity)
  }
}
