import { Op } from 'sequelize';
import GroupUser from '../models/GroupUser';
import Group from '../models/Group';

class IndexGroupIDUserService {
  async run({ userId }) {

    console.log('userID:', userId);

    const group_users = await GroupUser.findAll({
      where: { user_id: userId },
      attributes: ['id'],
      include: [
        {
          model: Group,
          as: 'group',
          attributes: ['id', 'name', 'description'],
        },
      ],
    });

    console.log('group_users:', group_users);


    return group_users;
  }
}
export default new IndexGroupIDUserService();
