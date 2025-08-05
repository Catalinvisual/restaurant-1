'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // 🧠 Dacă în model ai `field: 'is_new'`, trebuie să creezi coloana cu același nume în DB!
    await queryInterface.addColumn('menu', 'is_new', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false
    });

    await queryInterface.addColumn('menu', 'is_promo', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('menu', 'is_new');
    await queryInterface.removeColumn('menu', 'is_promo');
  }
};