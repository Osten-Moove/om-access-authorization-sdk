import { ExceptionDTO } from '@duaneoli/base-project-nest/'
import { CanActivate, ExecutionContext, HttpException, Injectable, SetMetadata } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { AuthorizationLibDefaultOwner } from '../helpers/AuthorizationLibVariables'
import { AuthorizationModule } from '../module/AuthorizationModule'
import { AuthorizationService } from '../services/AuthorizationService'
import { AuthorizationPayloadDTO, DecoratorConfig } from '../types'
import { AuthorizationEntityToString } from '../utils/AuthorizationUtils'

export const Authorization = (...permissions: string[]) => SetMetadata(AuthorizationLibDefaultOwner, permissions)
//
@Injectable()
export class AuthorizationGuard implements CanActivate {
  private decoratorConfig: DecoratorConfig
  constructor(private reflector: Reflector, private readonly authorizationService: AuthorizationService) {
    this.decoratorConfig = AuthorizationModule.decoratorConfig
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const permissions = this.reflector.getAllAndOverride<string[]>(AuthorizationLibDefaultOwner, [
      context.getHandler(),
      context.getClass(),
    ])

    if (!permissions || permissions.length === 0) {
      console.error(
        "ERROR: Permissions must be declared - You don't declared any permission from this route. Use @Authorization() decorator.",
      )
      ExceptionDTO.error(
        'Permissions must be declared',
        "You don't declared any permission from this route. Use @Authorization() decorator.",
      )
      return false
    }
    const request: AuthorizationPayloadDTO = context.switchToHttp().getRequest()
    const userId = this.decoratorConfig.getIdOfUserByRequest(request)
    const auth = await this.authorizationService.getAuthorizationByPermissions(permissions, userId)

    if (auth.length === 0) {
      throw new HttpException(
        ExceptionDTO.warn('Not authorized', "You don't have sufficient permissions to access this resource"),
        401,
      )
    }

    request.authorizationPayloadDTO = {
      entities: auth,
      permissions: new Set(auth.map((it) => AuthorizationEntityToString(it))),
    }

    return true
  }
}
