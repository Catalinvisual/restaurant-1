'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      UPDATE users
      SET "is_admin" = true, "role" = 'admin'
      WHERE LOWER(email) = 'catalin@yahoo.com';
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      UPDATE users
      SET "is_admin" = false, "role" = 'client'
      WHERE LOWER(email) = 'catalin@yahoo.com';
    `);
  }
};
