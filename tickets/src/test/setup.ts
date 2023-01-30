import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

let mongo: MongoMemoryServer;

declare global {
  var signup: () => string[];
}

jest.mock("../nats-wrapper");

beforeAll(async () => {
  process.env.JWT_KEY = "absd";
  mongo = await MongoMemoryServer.create();
  const mognoUri = mongo.getUri();
  await mongoose.connect(mognoUri);
});

beforeEach(async () => {
  jest.clearAllMocks();
  const collections = await mongoose.connection.db.collections();
  for (let collection of collections) await collection.deleteMany({});
});

afterAll(async () => {
  await mongo.stop();
  await mongoose.connection.close();
});

global.signup = (id?: string) => {
  // Build a jwt payload {id, email}
  const payload = {
    id: new mongoose.Types.ObjectId(),
    email: "test@test.com",
  };
  // Create the jwt
  const token = jwt.sign(payload, process.env.JWT_KEY!);
  // Build session object {jwt: JWT_VALUE}
  const session = { jwt: token };
  // Turn the session object into JSON
  const sessionJSON = JSON.stringify(session);
  // Encode JSON to base64
  const sessionBase64 = Buffer.from(sessionJSON).toString("base64");
  // return the cookie string with the encoded data
  return [`session=${sessionBase64}`];
};
