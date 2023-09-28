import { Injectable } from '@nestjs/common'
import { FindManyOptions, Repository } from 'typeorm'
import { AuthorizationEntity } from '../entities'
import { AuthorizationModule } from '../module/AuthorizationModule'
import { StringToAuthorizationEntity } from '../utils/AuthorizationUtils'

@Injectable()
export class AuthorizationService {
  private repository: Repository<AuthorizationEntity>

  constructor() {
    this.repository = AuthorizationModule.connection.getRepository(AuthorizationEntity)
  }

  async find(options?: FindManyOptions<AuthorizationEntity>): Promise<AuthorizationEntity[]> {
    return this.repository.find(options)
  }

  async findAndCount(options?: FindManyOptions<AuthorizationEntity>): Promise<[AuthorizationEntity[], number]> {
    return this.repository.findAndCount(options)
  }

  public async getAuthorizationByPermissions(permissions: Array<string>, userId: string) {
    const permissionDeacidified = permissions.map((it) => StringToAuthorizationEntity(it, userId))
    return this.repository.find({ where: permissionDeacidified })
  }

  // /**
  //  * Get all allowed resources to the user access from the mentioned permission
  //  * @param permission Permission in string format
  //  * @param userId id of the user to check the allowed resources
  //  * @returns array of allowed resources to the user access from the mentioned permission. If the user has access to all resources, it will return ['*']
  //  */
  // public async getAllowedResourcesFromPermission(permissions: Array<string>, userId: string): Promise<string[]> {
  //   const permissionDeacidified = permissions.map((it) => StringToAuthorizationEntity(it, userId))

  //   const resourcesBrute = await this.repository.find({
  //     where: permissionDeacidified,
  //     select: ['resource'],
  //   })

  //   if (resourcesBrute.find((resource) => resource.resource === '*')) return ['*']

  //   return resourcesBrute.map((resource) => resource.resource)
  // }

  // /**
  //  * Verify if operation is allowed to the user
  //  *
  //  * @param permission Permission in string format
  //  * @param resource Resource to check if the user has access
  //  * @param userId id of the user to check the allowed resources
  //  * @param origin Origin of the authorization check, if it is from the request or from the database
  //  * @returns true if the operation is allowed or false if not or undefined if the request is undefined and any abnormal behaviour occurs
  //  */
  // public async isAuthorized(
  //   permission: Array<string>,
  //   resource: string,
  //   userId: string,
  //   origin: 'REQUEST' | 'DATABASE' = 'REQUEST',
  // ): Promise<boolean> {
  //   switch (origin) {
  //     case 'REQUEST':
  //       if (this.request === undefined) return undefined

  //       const permissionDecodified = StringToAuthorizationEntity(permission, userId)
  //       const resourceIsPermitted = this.request.authorizationPayloadDTO.find((authorization) => {
  //         AuthorizationEntityToString(authorization)
  //         const sameMicroservice = permissionDecodified.microservice
  //           ? permissionDecodified.microservice === permission.microservice
  //           : true
  //         const sameController = permissionDecodified.controller
  //           ? permissionDecodified.controller === permission.controller
  //           : true
  //         const sameRouter = permissionDecodified.router ? permissionDecodified.router === permission.router : true
  //         const sameMethod = permissionDecodified.method ? permissionDecodified.method === permission.method : true
  //         const sameResource = permission.resource == '*' || permission.resource == resource

  //         return sameMicroservice && sameController && sameRouter && sameMethod && sameResource
  //       })

  //       return !!resourceIsPermitted
  //     case 'DATABASE':
  //       const resourcesOfTheRoute = await this.getAllowedResourcesFromPermission(permission, userId)

  //       return resourcesOfTheRoute.includes('*') || resourcesOfTheRoute.includes(resource)
  //   }

  //   return undefined
  // }

  // /**
  //  * Verify if operation is allowed to the user, if not, throw an exception
  //  * @param permission Permission in string format
  //  * @param resource Resource to check if the user has access
  //  * @param userId id of the user to check the allowed resources
  //  * @param origin Origin of the authorization check, if it is from the request or from the database
  //  * @returns true if the operation is allowed
  //  * @throws ExceptionDTO if the operation is not allowed
  //  */
  // public async isAuthorizedOrFail(
  //   permission: string,
  //   resource: string,
  //   userId: string,
  //   origin: 'REQUEST' | 'DATABASE' = 'REQUEST',
  // ): Promise<true> {
  //   const isAuthorized = await this.isAuthorized(permission, resource, userId, origin)

  //   if (!isAuthorized) throw ExceptionDTO.error('Not Allowed', 'You are not allowed to access this resource', [], 403)

  //   return true
  // }

  // /**
  //  * Verify what operations is allowed and what operations is not allowed to the user. In this function, always are make requests on database
  //  * @param permissionsAndResources Array of permissions and resources to check if the user has access
  //  * @param userId id of the user to check the allowed resources
  //  * @returns Array of permissions and resources with the authorized field, to mark if the user has access or not to the specified resource
  //  */
  // public async isAuthorizedMany(
  //   permissionsAndResources: PermissionResourceDTO[],
  //   userId: string,
  // ): Promise<PermissionResourceAuthorizationDTO[]> {
  //   const permissionsAndResourcesAuthorization: PermissionResourceAuthorizationDTO[] = []

  //   for (const permissionAndResource of permissionsAndResources) {
  //     const isAuthorized = await this.isAuthorized(
  //       permissionAndResource.permission,
  //       permissionAndResource.resource,
  //       userId,
  //       'DATABASE',
  //     )

  //     permissionsAndResourcesAuthorization.push({
  //       ...permissionAndResource,
  //       authorized: isAuthorized,
  //     })
  //   }

  //   return permissionsAndResourcesAuthorization
  // }

  // /**
  //  * Filter a array of data to return only the allowed resources to the user
  //  * @param data Data to be filtered
  //  * @param idResourceAttr Name of attribute of the data that contains the id of the resource
  //  * @param permission Permission in string format
  //  * @param userId id of the user to check the allowed resources
  //  * @returns A object with the allowed resources and the refused resources
  //  */
  // public async filterAllowedResources<T>(
  //   data: T[],
  //   idResourceAttr: keyof T,
  //   permission: string,
  //   userId: string,
  // ): Promise<FilteredAllowedResourcesDTO<T>> {
  //   const allowedResources = await this.getAllowedResourcesFromPermission(permission, userId)

  //   // return all data if the user has access to all resources
  //   if (allowedResources.includes('*')) return { allowed: data, refused: [] }

  //   return {
  //     allowed: data.filter((data) => allowedResources.includes(String(data[idResourceAttr]))),
  //     refused: data.filter((data) => !allowedResources.includes(String(data[idResourceAttr]))),
  //   }
  // }

  // /**
  //  * Filter a array of identifiers to return only the allowed resources identifiers to the user
  //  * @param data Data to be filtered containing the set of identifiers
  //  * @param permission Permission in string format
  //  * @param userId id of the user to check the allowed resources
  //  * @returns A object with the allowed resources and the refused resources
  //  */
  // public async filterAllowedIdsArray<T>(
  //   data: T[],
  //   permission: string,
  //   userId: string,
  // ): Promise<FilteredAllowedResourcesDTO<T>> {
  //   const allowedResources = await this.getAllowedResourcesFromPermission(permission, userId)

  //   if (allowedResources.includes('*')) return { allowed: data, refused: [] }

  //   return {
  //     allowed: data.filter((data) => allowedResources.includes(String(data))),
  //     refused: data.filter((data) => !allowedResources.includes(String(data))),
  //   }
  // }

  // /**
  //  * Get all authorized routes of the user
  //  * @param userId id of the user to check the allowed resources
  //  * @returns array of authorized routes of the user
  //  */
  // public async getAuthorized(userId: string): Promise<AuthorizationEntity[]> {
  //   return await this.repository.find({ where: { userId } })
  // }
}
