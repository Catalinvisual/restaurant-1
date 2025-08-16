'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('products', 'category', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'uncategorized'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('products', 'category');
  }
};
