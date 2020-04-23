import { addDays, isAfter, startOfSecond } from 'date-fns';

import * as Yup from 'yup';
import Queue from '../../lib/Queue';
import RecoverPasswordAWS from '../jobs/RecoverPasswordAWS';

import Token from '../models/Token';
import User from '../models/User';
import Person from '../models/Person';

class RecuperarPasswordController {
  async store(req, res) {
    const { email } = req.body;
    console.log('req.body', req.body);
    const schema = Yup.object().shape({
      email: Yup.string()
        .email()
        .required(),
    });

    if (await schema.isValid(email)) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const user = await User.findOne({
      attributes: ['id', 'person_id'],
      include: [
        {
          model: Person,
          as: 'person',
          attributes: ['id', 'name', 'email'],
          where: { email },
        },
      ],
    });

    console.log('user::: ', user );

    if (!user) {
      return res
        .status(401)
        .json({ error: 'Email não foi encontrado, crie sua conta!' });
    }

    const tokenAll = await Token.findAll({
      where: {
        user_id: user.id,
        status: false,
      },
    }).map(p => p.id);

    await Token.update(
      {
        status: true,
      },
      {
        where: {
          id: tokenAll,
        },
      }
    );

    // Create a verification token for this user
    const { code_active } = await Token.create({
      user_id: user.id,
      expires: addDays(new Date(), 1),
    });

    await Queue.add(RecoverPasswordAWS.key, {
      user: user.person,
      code_active,
    });

    return res.json({
      msg: `Token criado com sucesso, acessa o ${user.person.email} para recuperar sua senha!`,
    });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      password: Yup.string().min(1),
      confirmPassword: Yup.string().when('password', (password, field) =>
        password ? field.required().oneOf([Yup.ref('password')]) : field
      ),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { token } = req.body;
    const tokenExists = await Token.findOne({ where: { token } });

    // Make sure the user has been verified

    if (!tokenExists) {
      return res.status(403).json({
        error: 'Esse token não existe, crei um novo token!',
      });
    }

    const hourStart = startOfSecond(new Date(tokenExists.expires));

    if (!isAfter(hourStart, new Date())) {
      return res.status(404).json({
        error: 'Token expirado, gere novo token, em recuperar senha!',
      });
    }

    const user = await User.findByPk(tokenExists.user_id);
    if (!tokenExists && !user) {
      return res.status(401).json({
        error: 'Não foi possível encontra um usuário para esse token!',
      });
    }

    await user.update(req.body);

    // await tokenExists.update({ status: true });

    await Token.update(
      { status: true, tokenExists },
      { where: { id: tokenExists.id } }
    );

    return res.status(200).json({
      msg:
        'Nova senha cadastrada com sucesso, já pode acessar a área restrita!',
    });
  }
}

export default new RecuperarPasswordController();
