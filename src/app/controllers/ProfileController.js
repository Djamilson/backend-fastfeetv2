import User from '../models/User';
import Phone from '../models/Phone';
import Person from '../models/Person';
import IndexGroupIDUserService from '../services/IndexGroupIDUserService';
import Deliveryman from '../models/Deliveryman';
import File from '../models/File';
import FormatDataLocal from '../util/formatDataLocal';

class ProfileController {
  async update(req, res) {

    const { name, email, phone, oldPassword, password } = req.body.data;
    const { prefix, number } = phone;

    const user = await User.findByPk(req.userId);

    const person = await Person.findByPk(user.person_id);

    if (email !== person.email) {
      const personExists = await Person.findOne({ where: { email } });

      if (personExists) {
        return res.status(403).json({ error: 'User already exists.' });
      }
    }


    const phoneExist = await Phone.findByPk(phone.phone_id, {
      attributes: ['id', 'prefix', 'number'],
    });

    if (!phoneExist) {
      return res.status(404).json({ error: 'Phone not exists.' });
    }

    if (prefix !== phoneExist.prefix || number !== phoneExist.number) {
      const newPhone = await Phone.findOne({
        where: { prefix, number },
        attributes: ['id', 'prefix', 'number'],
      });

      if (newPhone) {
        return res.status(405).json({ error: 'Phone already exists.' });
      }
    }

    await person.update({ name, email });
    await phoneExist.update({ prefix, number });

    if (oldPassword && !(await user.checkPassword(oldPassword))) {
      return res.status(401).json({ error: 'Password does not match' });
    }
    await user.update({ password });

    const group_users = await IndexGroupIDUserService.run({ userId: user.id });

    const { id: deliverymanId } = await Deliveryman.findOne({
      where: { person_id: user.person_id },
    });


    const user_ = await User.findByPk(req.userId, {
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


    const {
      id: userId,
      person: newPerson,
      is_verified,
      last_login_at,
      created_at,
    } = user_;

    const date_ = await FormatDataLocal.subHours_time({
      date_at: created_at,
    });

    return res.json({
      user: {
        id: userId,
        person: newPerson,
        is_verified,
        group_users,
        last_login_at,
        created_at: date_,
        deliverymanId,
      },
    });/*
     return res.json(
      { t: true }
    );*/
  }
}

export default new ProfileController();
