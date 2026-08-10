const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    gender: {
      type: String,
      trim: true,
      default: 'Male',
    },
    address: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true, versionKey: false },
    toObject: { virtuals: true, versionKey: false },
  }
);

patientSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

module.exports = mongoose.model('Patient', patientSchema);
