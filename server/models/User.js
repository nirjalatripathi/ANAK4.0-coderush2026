const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { ROLES } = require('../utils/constants');

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.CITIZEN,
    },
    fullName: { type: String, required: true, trim: true },
    isActive: { type: Boolean, default: true },
    lastLoginAt: { type: Date },
    citizen: { type: mongoose.Schema.Types.ObjectId, ref: 'Citizen' },
    campOfficial: { type: mongoose.Schema.Types.ObjectId, ref: 'CampOfficial' },
    localAuthority: { type: mongoose.Schema.Types.ObjectId, ref: 'LocalAuthority' },
  },
  { timestamps: true }
);

userSchema.pre('save', async function hashPassword() {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toSafeObject = function toSafeObject() {
  return {
    id: this._id,
    email: this.email,
    role: this.role,
    fullName: this.fullName,
    isActive: this.isActive,
    citizen: this.citizen,
    campOfficial: this.campOfficial,
    localAuthority: this.localAuthority,
    lastLoginAt: this.lastLoginAt,
  };
};

module.exports = mongoose.model('User', userSchema);
