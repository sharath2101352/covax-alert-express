'use strict';
const mongoose = require('mongoose');

const Notification = new mongoose.Schema({
  uid: { type: String, required: true },
  age: { type: String, required: true },
  districts: { type: Array, required: true },
  distNames: { type: Array, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Notification', Notification);
