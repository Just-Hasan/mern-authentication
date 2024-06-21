import mongoose from "mongoose";
const UserSchema = new mongoose.Schema({
  firstName: {
    type: String,
    require: true,
  },
  lastName: {
    type: String,
    require: true,
  },
  email: {
    type: String,
    required: true,
    validate: {
      validator: (receiveEmail) => {
        return /@gmail\.com$/.test(receiveEmail);
      },
      message: "Email must contain @gmail.com",
    },
  },
  password: {
    type: String,
    required: true,
  },
});

const UserModel = mongoose.model("User", UserSchema, "user");

export { UserModel as User };
