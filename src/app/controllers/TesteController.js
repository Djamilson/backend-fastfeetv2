
class TesteController {
  async index(req, res) {

    return res.status(200).json({
      msg:
        'teste!',
    });
  }
}

export default new TesteController();
