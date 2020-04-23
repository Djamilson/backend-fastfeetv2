import { isAfter, startOfSecond } from 'date-fns';

import Person from '../models/Person';
import Token from '../models/Token';
import User from '../models/User';

class TokenController {
  //retorno para o select
  async index(req, res) {
    const { email } = req.query;
    console.log('req.queryreq.queryreq.query:: ', req.query);
    const userExists = await User.findOne({
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

    const { id: user_id } = userExists;
    // Make sure the user has been verified

    if (!userExists) {
      return res.status(400).json({
        error: 'Esse usuário não existe, crie uma conta!',
      });
    }

    const tokenExists = await Token.findOne({
      where: { user_id, status: false },
    });

    // Make sure the user has been verified
    console.log('===>>>tokenExiststokenExists: ', tokenExists);
    if (!tokenExists) {
      return res.status(401).json({
        error: 'Esse token não existe, crie um novo token!',
      });
    }
    const hourStart = startOfSecond(new Date(tokenExists.expires));

    if (!isAfter(hourStart, new Date())) {
      return res.status(402).json({
        error: 'Token expirado, gere um novo token!',
      });
    }

    return res.status(200).json(tokenExists);
  }
}

export default new TokenController();
