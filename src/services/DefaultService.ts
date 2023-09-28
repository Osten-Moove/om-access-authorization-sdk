import { Injectable } from '@nestjs/common'
import { EntityTarget, FindManyOptions, FindOneOptions, FindOptionsWhere, Repository } from 'typeorm'
import { AuthorizationModule } from '../module/AuthorizationModule'

@Injectable()
export class DefaultService<T> {
  protected repository: Repository<T>

  constructor(target: EntityTarget<T>) {
    this.repository = AuthorizationModule.connection.getRepository(target)
  }

  /**
   * Finds entities that match given find options.
   */
  async find(options?: FindManyOptions<T>): Promise<T[]> {
    return this.repository.find(options)
  }

  /**
   * Finds entities that match given find options.
   * Also counts all entities that match given conditions,
   * but ignores pagination settings (from and take options).
   */
  async findAndCount(options?: FindManyOptions<T>): Promise<[T[], number]> {
    return this.repository.findAndCount(options)
  }

  /**
   * Finds first entity by a given find options.
   * If entity was not found in the database - returns null.
   */
  async findOne(options: FindOneOptions<T>): Promise<T | null> {
    return this.repository.findOne(options)
  }

  /**
   * Finds first entity that matches given where condition.
   * If entity was not found in the database - returns null.
   */
  async findOneBy(where: FindOptionsWhere<T> | FindOptionsWhere<T>[]): Promise<T | null> {
    return this.repository.findOneBy(where)
  }

  /**
   * Finds entities that match given find options.
   */
  async findBy(where: FindOptionsWhere<T> | FindOptionsWhere<T>[]): Promise<T[]> {
    return this.repository.findBy(where)
  }
}
