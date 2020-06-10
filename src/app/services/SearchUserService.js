import File from '../models/File';
import User from '../models/User';

import Phone from '../models/Phone';
import Person from '../models/Person';
import IndexGroupIDUserService from '../services/IndexGroupIDUserService';
import Deliveryman from '../models/Deliveryman';

class SearchUserService {
  async run({ userId }) {
    const user = await User.findByPk(userId, {
      attributes: [
        'id',
        'is_verified',
        'admin_master',
        'last_login_at',
        'person_id',
        'created_at',
      ],
      include: [
        {
          model: Person,
          as: 'person',
          attributes: [
            'id',
            'name',
            'email',
            'status',
            'privacy',
            'phone_man_id',
          ],
          include: [
            {
              model: Phone,
              as: 'phone',
              attributes: ['id', 'prefix', 'number'],
            },
            {
              model: File,
              as: 'avatar',
              attributes: ['id', 'path', 'url'],
            },
          ],
        },
      ],
    });

    const group_users = await IndexGroupIDUserService.run({ userId });

    let deliverymanId;
    const deliveryman = await Deliveryman.findOne({
      where: { person_id: user.person_id },
    });

    if (deliveryman) {
      deliverymanId = deliveryman.id;
    }

    const { id, person, is_verified, last_login_at, created_at } = user;

    const userNew = {
      created_at,
      deliverymanId,
      group_users,
      id,
      person,
      is_verified,
      last_login_at,
    };

    return { user: userNew };
  }
}
export default new SearchUserService();
