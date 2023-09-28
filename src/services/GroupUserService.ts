import { Injectable } from '@nestjs/common'
import { GroupUserEntity } from '../entities/GroupUserEntity'
import { DefaultService } from './DefaultService'

@Injectable()
export class GroupUserService extends DefaultService<GroupUserEntity> {
  constructor() {
    super(GroupUserEntity)
  }
}
