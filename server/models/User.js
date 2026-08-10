const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['patient', 'doctor', 'admin'],
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.password;
      },
    },
    toObject: {
      virtuals: true,
      versionKey: false,
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.password;
      },
    },
  }
);

module.exports = mongoose.model('User', userSchema);
