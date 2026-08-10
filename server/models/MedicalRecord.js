const mongoose = require('mongoose');

const medicalRecordSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true,
    },
    diagnosis: {
      type: String,
      required: true,
      trim: true,
    },
    notes: {
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

medicalRecordSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

module.exports = mongoose.model('MedicalRecord', medicalRecordSchema);
