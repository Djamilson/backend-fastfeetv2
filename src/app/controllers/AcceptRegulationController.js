import User from '../models/User';
import Phone from '../models/Phone';
import Person from '../models/Person';
import IndexGroupIDUserService from '../services/IndexGroupIDUserService';
import Deliveryman from '../models/Deliveryman';

import File from '../models/File';

import FormatDataLocal from '../util/formatDataLocal';

class AcceptRegulationController {
  async update(req, res) {
    const { newPrivacy, person_id } = req.body;

    const personExist = await Person.findByPk(person_id);

    if (!personExist) {
      return res.status(400).json({ message: 'not found user' });
    }

    await personExist.update({ privacy: newPrivacy });

    const user = await User.findOne({
      attributes: [
        'id',
        'password_hash',
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
          where: { id: person_id },
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

    // Make sure the user has been verified
    if (!user) {
      return res.status(403).json({ error: 'User not found' });
    }
    // Make sure the user has been verified
    if (user && !user.is_verified) {
      return res.status(401).json({
        error:
          'Seu email ainda não foi validado, acesse sua conta de email e confirme a validação do acesso!',
      });
    }

    // Make sure the user has been verified
    if (user && !user.person.status) {
      return res.status(402).json({
        error:
          'No momento esse usuário está desativado, entre em contato com o administrador!',
      });
    }

    const group_users = await IndexGroupIDUserService.run({ userId: user.id });

    const { id: deliverymanId } = await Deliveryman.findOne({
      where: { person_id },
    });

    const {
      id,
      person,
      is_verified,
      last_login_at,
      created_at,
    } = user;

    const date_ = await FormatDataLocal.subHours_time({
      date_at: created_at,
    });

    return res.json({
      user: {
        id,
        person,
        is_verified,
        group_users,
        last_login_at,
        created_at: date_,
        deliverymanId,
      },
    });

  }
}

export default new AcceptRegulationController();
