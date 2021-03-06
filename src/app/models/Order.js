import Sequelize, { Model } from 'sequelize';
import {
  getDate,
  getMonth,
  getYear,
  parseISO,
  format,
  addHours,
  isAfter,
} from 'date-fns';

import CompareHour from '../util/compareHour';

class Order extends Model {
  static init(sequelize) {
    super.init(
      {
        product: Sequelize.STRING,
        canceled_at: Sequelize.DATE,
        start_date: Sequelize.DATE,
        end_date: Sequelize.DATE,
        observation: Sequelize.TEXT,
        problem: Sequelize.BOOLEAN,
        delete_at: Sequelize.DATE,
        status: {
          type: Sequelize.VIRTUAL,
          get() {
            if (this.canceled_at !== null) {
              return 'Cancelada';
            }

            if (this.start_date === null) {
              return 'retirada';
            }

            if (this.start_date !== null && this.end_date === null) {
              return 'Pendente';
            }

            return 'Entregue';
          },
        },

        color: {
          type: Sequelize.VIRTUAL,
          get() {
            if (this.canceled_at !== null) {
              return { color_one: '#DE3B3B', color_two: '#FAB0B0' };
            }

            if (this.start_date === null) {
              return { color_one: '#4D85EE', color_two: '#BAD2FF' };
            }

            if (this.start_date !== null && this.end_date === null) {
              return { color_one: '#C1BC35', color_two: '#F0F0DF' };
            }

            return { color_one: '#2CA42B', color_two: '#DFF0DF' };
          },
        },

        withdrawal: {
          type: Sequelize.VIRTUAL,
          get() {
            if (this.start_date !== null) {
              return true;
            }
            return false;
          },
        },
        delivered: {
          type: Sequelize.VIRTUAL,
          get() {
            if (this.end_date !== null) {
              return true;
            }
            return false;
          },
        },
        withdrawProduct: {
          type: Sequelize.VIRTUAL,
          get() {
            return CompareHour.run();
          },
        },
      },
      { sequelize }
    );

    return this;
  }

  static associate(models) {
    this.belongsTo(models.Recipient, {
      foreignKey: 'recipient_id',
      as: 'recipient',
    });

    this.belongsTo(models.Deliveryman, {
      foreignKey: 'deliveryman_id',
      as: 'deliveryman',
    });

    this.belongsTo(models.File, {
      foreignKey: 'signature_id',
      as: 'signature',
    });
  }
}

export default Order;
