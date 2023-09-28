import { DynamicModule, Global, Module } from '@nestjs/common'
import { APP_GUARD } from '@nestjs/core'
import { DataSource, DataSourceOptions } from 'typeorm'
import { AuthorizationGuard } from '../decorators/Authorization'
import { AuthorizationEntity } from '../entities/AuthorizationEntity'
import { GroupEntity } from '../entities/GroupEntity'
import { GroupPolicyEntity } from '../entities/GroupPolicyEntity'
import { GroupUserEntity } from '../entities/GroupUserEntity'
import { PermissionEntity } from '../entities/PermissionEntity'
import { PolicyEntity } from '../entities/PolicyEntity'
import { PolicyPermissionEntity } from '../entities/PolicyPermissionEntity'
import { AuthorizationLibDefaultOwner } from '../helpers/AuthorizationLibVariables'
import { AuthorizationManagerService } from '../services/AuthorizationManagerService'
import { AuthorizationService } from '../services/AuthorizationService'
import { ControlService } from '../services/ControlService'
import { GroupPolicyService } from '../services/GroupPolicyService'
import { GroupService } from '../services/GroupService'
import { GroupUserService } from '../services/GroupUserService'
import { PermissionService } from '../services/PermissionService'
import { PolicyPermissionService } from '../services/PolicyPermissionService'
import { PolicyService } from '../services/PolicyService'
import { UserService } from '../services/UserService'
import { DecoratorConfig } from '../types'

@Global()
@Module({})
export class AuthorizationModule {
  static connection: DataSource
  static decoratorConfig: DecoratorConfig
  static forRoot(database: DataSourceOptions, decoratorConfig: DecoratorConfig): DynamicModule {
    this.decoratorConfig = decoratorConfig
    const entities = [
      PermissionEntity,
      PolicyPermissionEntity,
      PolicyEntity,
      GroupUserEntity,
      GroupEntity,
      GroupPolicyEntity,
      AuthorizationEntity,
    ]

    const services = [
      GroupPolicyService,
      GroupService,
      GroupUserService,
      PermissionService,
      PolicyPermissionService,
      PolicyService,
      ControlService,
      UserService,
      AuthorizationService,
      AuthorizationManagerService,
    ]

    this.connection = new DataSource({
      ...database,
      entities,
      name: AuthorizationLibDefaultOwner,
    })

    return {
      global: true,
      module: AuthorizationModule,
      imports: [],
      providers: [
        ...services,
        {
          provide: APP_GUARD,
          useClass: AuthorizationGuard,
        },
      ],
      exports: services,
    }
  }

  async onModuleInit() {
    await AuthorizationModule.connection.initialize()
  }

  async onModuleDestroy() {
    await AuthorizationModule.connection.destroy()
  }
}
