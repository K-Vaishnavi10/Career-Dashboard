/**
 * User store — backed by MongoDB (Mongoose).
 * Public interface (findOrCreateUser, findUserById) is unchanged so that
 * passport.js and auth.routes.js require no modifications.
 */
const User = require('../models/User.model');

async function findOrCreateUser({ provider, providerId, name, email, avatarUrl }) {
  const id = `${provider}_${providerId}`;

  const user = await User.findOneAndUpdate(
    { provider, providerId },
    {
      $set: { id, provider, providerId, name, email, avatarUrl },
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  ).lean();

  return user;
}

async function findUserById(id) {
  return User.findOne({ id }).lean();
}

module.exports = { findOrCreateUser, findUserById };
