import { Op } from 'sequelize';

import crypto from 'crypto';
import { isAfter, addDays, startOfSecond } from 'date-fns';
import * as Yup from 'yup';

import Queue from '../../lib/Queue';
import Group from '../models/Group';
import GroupUser from '../models/GroupUser';
import Token from '../models/Token';
import User from '../models/User';

class UserMobilController {
  async update(req, res) {
    const schema = Yup.object().shape({
      password: Yup.string().min(1),
      confirmPassword: Yup.string().when('password', (password, field) =>
        password ? field.required().oneOf([Yup.ref('password')]) : field
      ),
    });

    if (!(await schema.isValid(req.body.data))) {
      return res.status(400).json({ error: 'Validation fails' });
    }
    const { token, password } = req.body.data;
    const tokenExist = await Token.findByPk(token.id);
    const { user_id, expires, status } = tokenExist;

    // Make sure the user has been verified

    if (!tokenExist) {
      return res.status(403).json({
        error: 'Esse token não existe, crei um novo token!',
      });
    }

    if (tokenExist && status === true) {
      return res.status(402).json({
        error: 'Token inválido, já foi usado, crie novo Token!',
      });
    }

    const hourStart = startOfSecond(new Date(expires));

    if (!isAfter(hourStart, new Date())) {
      return res.status(404).json({
        error: 'Token expirado, gere novo token, em recuperar senha!',
      });
    }

    const userExist = await User.findByPk(user_id);

    if (!tokenExist && !userExist) {
      return res.status(401).json({
        error: 'Não foi possível encontra um usuário para esse token!',
      });
    }

    await userExist.update({ password });
    await tokenExist.update({ status: true });

    return res.status(200).json({
      msg:
        'Nova senha cadastrada com sucesso, já pode acessar a área restrita!',
    });
  }
}

export default new UserMobilController();
