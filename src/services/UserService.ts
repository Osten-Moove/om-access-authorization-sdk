import { Inject, Injectable } from '@nestjs/common'
import { GroupService } from './GroupService'

@Injectable()
export class UserService {
  constructor(@Inject(GroupService) readonly group: GroupService) {}

  /**
   * Add policies direct for user for the specified owner
   */
  async addPolicy(userId: string, policyIds: Array<string>, owner: string) {
    const groupUser = await this.group.findOneBy({ id: userId })
    if (!groupUser)
      return this.group.create(
        [
          {
            id: userId,
            alias: `user_id:${userId}`,
            description: 'Group for policy attached directly for user',
            users: [{ userId }],
            policies: policyIds.map((it) => ({ policyId: it })),
          },
        ],
        owner,
      )
    else await this.group.addPolicies(userId, policyIds, owner)
  }

  /**
   * Remove policies direct for user for the specified owner
   */
  async removePolicy(userId: string, policyIds: Array<string>, owner: string) {
    return this.group.removePolicy(userId, policyIds, owner)
  }
}
