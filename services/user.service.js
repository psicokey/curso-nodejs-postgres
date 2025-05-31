const boom = require('@hapi/boom');

const { models } = require('./../libs/sequelize');

class UserService {
  constructor() {}

  async create(data) {
    const newUser = await models.User.create(data);
    return newUser;
  }

   async find() {
    const rta = await models.Customer.findAll({
      include: [
        {
          association: 'user', // This is the 'user' association
          attributes: { exclude: ['password'] } // <--- Exclude password from the User model here!
        }
      ],
      // No 'exclude' directly on Customer for password
    });
    return rta;
  }

  async findOne(id) {
    const user = await models.User.findByPk(id);
    if (!user) {
      throw boom.notFound('user not found');
    }
    return user;
  }

  async update(id, changes) {
    const user = await this.findOne(id);
    const rta = await user.update(changes);
    return rta;
  }

  async delete(id) {
    const user = await this.findOne(id);
    await user.destroy();
    return { id };
  }
}

module.exports = UserService;