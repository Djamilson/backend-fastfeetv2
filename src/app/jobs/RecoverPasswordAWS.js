import Mail from '../../lib/Mail';
import mailConfigSESAWS from '../../config/sesAWS';

class RecoverPasswordAWS {
  get key() {
    return 'RecoverPasswordAWS';
  }

  async handle({ data }) {
    const { user, code_active } = data;
    const { from } = mailConfigSESAWS.aws.ses;

    const mailOptions = {
      template: 'recoverPassword',
      from: from.default,
      to: `${user.name} <${user.email}>`,
      subject: `${code_active}`,
      context: {
        user: user.name,
        code_active,
      },
      ReturnPath: from.default,
      Source: from.default,
    };

    try {
      await Mail.sendMail(mailOptions, err => {
        // console.log('>>>!!!', mailOptions);
        if (err) {
          //console.log(err, err.stack);
        }
      });
    } catch (err) {
      //console.log('a casa caiu!!!', err);
    }
  }
}

export default new RecoverPasswordAWS();
