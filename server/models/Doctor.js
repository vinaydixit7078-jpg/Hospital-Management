const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    specialization: {
      type: String,
      default: '',
      trim: true,
    },
    consultation_fee: {
      type: Number,
      default: 500,
    },
    availability: {
      type: String,
      default: 'Available',
      trim: true,
    },
    status: {
      type: String,
      default: 'Active',
      trim: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true, versionKey: false },
    toObject: { virtuals: true, versionKey: false },
  }
);

doctorSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

module.exports = mongoose.model('Doctor', doctorSchema);
