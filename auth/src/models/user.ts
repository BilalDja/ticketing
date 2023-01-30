import mongoose from "mongoose";
import { Password } from "../services/password";
// Interface that descibes the properties that are required to create a new user
interface IUser {
  email: string;
  password: string;
}

// Interface that describes the properties that are avaible for User model
interface UserModel extends mongoose.Model<UserDoc> {
  build(user: IUser): UserDoc;
}

// Interface that describes the properties the User document has
interface UserDoc extends mongoose.Document {
  email: string;
  password: string;
}

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  {
    toJSON: {
      transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.password;
        delete ret.__v;
      },
    },
  }
);

userSchema.pre("save", async function (done) {
  if (this.isModified("password")) {
    const hashedPassword = await Password.toHash(this.password);
    this.set("password", hashedPassword);
  }
  done();
});

userSchema.statics.build = (user: IUser) => {
  return new User(user);
};

const User = mongoose.model<UserDoc, UserModel>("User", userSchema);

export { User };
