import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcrypt";

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
});

userSchema.pre("save", async function (next) {
  // Only hash if the field was modified or is new
  if (!this.isModified("password")) return next();

  // Hash the password
  this.password = await bcrypt.hash(this.password, 12);

  this.passwordConfirm = undefined;

  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  hashedPassword
) {
  return await bcrypt.compare(candidatePassword, hashedPassword);
};

const User = mongoose.model("User", userSchema);

export default User;
