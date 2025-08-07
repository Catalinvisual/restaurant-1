'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('menu', 'category', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'mancare' // sau 'bautura', în funcție de ce ai
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('menu', 'category');
  }
};