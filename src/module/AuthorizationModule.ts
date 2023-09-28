import { DynamicModule, Module } from '@nestjs/common'
import { DataSource, DataSourceOptions } from 'typeorm'
import { AuthorizationEntity } from '../entities/AuthorizationEntity'
import { GroupEntity } from '../entities/GroupEntity'
import { GroupPolicyEntity } from '../entities/GroupPolicyEntity'
import { GroupUserEntity } from '../entities/GroupUserEntity'
import { PermissionEntity } from '../entities/PermissionEntity'
import { PolicyEntity } from '../entities/PolicyEntity'
import { PolicyPermissionEntity } from '../entities/PolicyPermissionEntity'
import { AuthorizationLibDefaultOwner } from '../helpers/AuthorizationLibVariables'
import { ControlService } from '../services/ControlService'
import { GroupPolicyService } from '../services/GroupPolicyService'
import { GroupService } from '../services/GroupService'
import { GroupUserService } from '../services/GroupUserService'
import { PermissionService } from '../services/PermissionService'
import { PolicyPermissionService } from '../services/PolicyPermissionService'
import { PolicyService } from '../services/PolicyService'
import { UserService } from '../services/UserService'

@Module({})
export class AuthorizationModule {
  static connection: DataSource
  static forRoot(database: DataSourceOptions): DynamicModule {
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
      providers: services,
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
