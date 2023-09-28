import { RequestDTO } from '@duaneoli/base-project-nest'
import { Inject, Injectable, Scope } from '@nestjs/common'
import { REQUEST } from '@nestjs/core'
import { AuthorizationPayloadDTO } from '../types'
import { AuthorizationService } from './AuthorizationService'

@Injectable({ scope: Scope.REQUEST })
export class AuthorizationManagerService {
  constructor(
    @Inject(REQUEST) private readonly request: RequestDTO & AuthorizationPayloadDTO,
    @Inject(AuthorizationService) private readonly authorizationService: AuthorizationService,
  ) {}

  isAuthorized() {
    console.log(this.request.authorizationPayloadDTO)
  }
}
