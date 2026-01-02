import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcrypt";
import crypto from "crypto";

const userSchema = new mongoose.Schema({
  first_name: {
    type: String,
    required: [true, "A User Must have a first Name"],
  },
  last_name: {
    type: String,
    required: [true, "A User Must have a last Name"],
  },
  email: {
    type: String,
    required: [true, "Email must be provided"],
    unique: [true, "This Email belongs to another user"],
    validate: {
      validator: validator.isEmail,
      message: "Please provide a valid email address",
    },
  },
  date_of_birth: {
    type: Date,
    required: [true, "DoB must be provided"],
    validate: {
      validator: function (value) {
        return validator.isISO8601(value.toISOString());
      },
      message: "Date of Birth must be a valid date",
    },
  },
  nationality: {
    type: String,
  },
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
  role: {
    type: String,
    enum: ["user", "staff", "admin", "owner"],
    default: "user",
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
    minlength: 8,
    select: false,
  },

  passwordConfirm: {
    type: String,
    required: [true, "Please provide a password"],
    minlength: 8,
    validate: {
      //The variable el represent the entire Object
      //validator only works on SAVE!! or ON CREATE!!
      validator: function (el) {
        return el === this.password;
      },
      message: "Passwords are not the same",
    },
  },

  created_at: {
    type: Date,
    default: Date.now(),
  },
  last_login: {
    type: Date,
    default: Date.now(),
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordExpireTime: Date,
});

userSchema.pre("save", async function (next) {
  // Only hash if the field was modified or is new
  if (!this.isModified("password")) return next();

  // Hash the password
  this.password = await bcrypt.hash(this.password, 12);

  this.passwordConfirm = undefined;

  // Set passwordChangedAt timestamp
  this.passwordChangedAt = Date.now() - 3000;

  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  hashedPassword
) {
  return await bcrypt.compare(candidatePassword, hashedPassword);
};

userSchema.methods.changePasswordAfter = function (JWTTimeStamp) {
  if (this.passwordChangedAt) {
    //console.log("The time stamp is here");
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    return JWTTimeStamp < changedTimestamp;
  }
  console.log(changedTimestamp, JWTTimeStamp);
  // False means NOT changed
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  //   console.log({ resetToken }, this.passwordResetToken);

  this.passwordExpireTime = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model("User", userSchema);

export default User;
