import { ExceptionDTO } from '@duaneoli/base-project-nest'
import { Injectable } from '@nestjs/common'
import { FindOptionsOrder, FindOptionsWhere } from 'typeorm'
import { PermissionEntity } from '../entities/PermissionEntity'
import { DefaultService } from './DefaultService'

@Injectable()
export class PermissionService extends DefaultService<PermissionEntity> {
  constructor() {
    super(PermissionEntity)
  }

  private async findAndCountWithGroup(
    keys: Array<string>,
    filteredFilters: any,
    filteredSortBy: any,
    page: number,
    pageSize: number,
  ): Promise<[Array<PermissionEntity>, number]> {
    const queryEntities = this.repository
      .createQueryBuilder()
      .select(keys)
      .where(filteredFilters)
      .take(pageSize)
      .skip(page)
      .orderBy(filteredSortBy)

    const queryCount = this.repository.createQueryBuilder().select('1').where(filteredFilters)

    for (const key of keys) {
      queryEntities.addGroupBy(key)
      queryCount.addGroupBy(key)
    }

    const [entities, count]: [Array<PermissionEntity>, Array<1>] = await Promise.all([
      queryEntities.getRawMany(),
      queryCount.getRawMany(),
    ])
    return [this.repository.create(entities), count.length]
  }

  private filteredKeysOfFilterAndSortBy(
    filters: FindOptionsWhere<PermissionEntity>[] | FindOptionsWhere<PermissionEntity>,
    sortBy: FindOptionsOrder<PermissionEntity>,
    keys: Array<string>,
  ) {
    const filteredFilters = Object.fromEntries(Object.entries(filters).filter(([key]) => keys.includes(key)))
    const filteredSortBy = Object.fromEntries(Object.entries(sortBy).filter(([key]) => keys.includes(key)))
    return { filteredFilters, filteredSortBy }
  }

  private async getByKey(
    keys: Array<string>,
    filters: any,
    sortBy: any,
    page = 0,
    pageSize = 20,
  ): Promise<[PermissionEntity[], number]> {
    const f = this.filteredKeysOfFilterAndSortBy(filters, sortBy, keys)
    for (const key of keys.slice(0, -1)) {
      if (!f.filteredFilters[key] || f.filteredFilters[key].length > 1)
        throw ExceptionDTO.warn('Required filter', `For get required filtered by ${key}`)
    }

    return await this.findAndCountWithGroup(keys, f.filteredFilters, f.filteredSortBy, page, pageSize)
  }

  /**
   * Retrieve a grouped list based on the 'microservice' column with counts.
   *
   * This function retrieves a list of items from the database and groups them based on the 'microservice' column.
   * It also provides a count of items in each group.
   *
   */
  getMicroservices = (
    filters: FindOptionsWhere<PermissionEntity>[] | FindOptionsWhere<PermissionEntity>,
    sortBy: FindOptionsOrder<PermissionEntity>,
    page = 0,
    pageSize = 20,
  ) => this.getByKey(['microservice'], filters, sortBy, page, pageSize)

  /**
   * Retrieve a grouped list based on the 'controller' column with counts.
   *
   * This function retrieves a list of items from the database and groups them based on the 'microservice' column.
   * It also provides a count of items in each group.
   *
   */
  getControllers = (
    filters: FindOptionsWhere<PermissionEntity>[] | FindOptionsWhere<PermissionEntity>,
    sortBy: FindOptionsOrder<PermissionEntity>,
    page = 0,
    pageSize = 20,
  ) => this.getByKey(['microservice', 'controller'], filters, sortBy, page, pageSize)

  /**
   * Retrieve a grouped list based on the 'Routers' column with counts.
   *
   * This function retrieves a list of items from the database and groups them based on the 'microservice' column.
   * It also provides a count of items in each group.
   *
   */
  getRouters = (
    filters: FindOptionsWhere<PermissionEntity>[] | FindOptionsWhere<PermissionEntity>,
    sortBy: FindOptionsOrder<PermissionEntity>,
    page = 0,
    pageSize = 20,
  ) => this.getByKey(['microservice', 'controller', 'router'], filters, sortBy, page, pageSize)

  /**
   * Retrieve a grouped list based on the 'Method' column with counts.
   *
   * This function retrieves a list of items from the database and groups them based on the 'microservice' column.
   * It also provides a count of items in each group.
   *
   */
  getMethods = (
    filters: FindOptionsWhere<PermissionEntity>[] | FindOptionsWhere<PermissionEntity>,
    sortBy: FindOptionsOrder<PermissionEntity>,
    page = 0,
    pageSize = 20,
  ) => this.getByKey(['microservice', 'controller', 'router', 'method'], filters, sortBy, page, pageSize)
}
