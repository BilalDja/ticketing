import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

let mongo: MongoMemoryServer;

declare global {
  var signup: (id?: string) => string[];
}

jest.mock("../nats-wrapper");

process.env.STRIPE_KEY =
  "sk_test_51MVg1qIdxze1rIecBw56wqZwfvTyMv67uimob7L41t7ipPWxMGbajwWOD01ZEhrM6IB2aUw0w3bxciTFODUdlSd400FROyqyOL";

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
  if (mongo) {
    await mongo.stop();
  }
});

global.signup = (id?: string) => {
  // Build a jwt payload {id, email}
  const payload = {
    id: id || new mongoose.Types.ObjectId(),
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
