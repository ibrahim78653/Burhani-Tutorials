const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');

module.exports = async function seedAdmin() {
  try {
    const existing = await Admin.findOne({ username: process.env.ADMIN_USERNAME });
    if (!existing) {
      const hash = await bcrypt.hash(process.env.ADMIN_PASSWORD, 12);
      await Admin.create({ username: process.env.ADMIN_USERNAME, password: hash });
      console.log('✅ Admin seeded:', process.env.ADMIN_USERNAME);
    }
  } catch (err) {
    console.error('Seed error:', err.message);
  }
};
