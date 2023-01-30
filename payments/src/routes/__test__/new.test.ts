import { OrderStatus } from "@djagotickets/common";
import { Types } from "mongoose";
import request from "supertest";
import { app } from "../../app";
import { Order } from "../../models/order";
import { Payment } from "../../models/payment";
import { stripe } from "../../stripe";

// jest.mock("../../stripe");

it("should return 401 if hte user is not authenticated", async () => {
  await request(app)
    .post("/api/payments")
    .send({ token: "a token", orderId: "random id" })
    .expect(401);
});

it("sould return 400 if token or orderId is not provided", async () => {
  await request(app)
    .post("/api/payments")
    .set("Cookie", signup())
    .send({ orderId: "random id" })
    .expect(400);

  await request(app)
    .post("/api/payments")
    .set("Cookie", signup())
    .send({ token: "the Token" })
    .expect(400);
});

it("should return 404 if order does not exist", async () => {
  await request(app)
    .post("/api/payments")
    .set("Cookie", signup())
    .send({ token: "a token", orderId: new Types.ObjectId().toHexString() })
    .expect(404);
});

it("should 401 if user does not own the order", async () => {
  const userId = new Types.ObjectId().toHexString();
  const order = Order.build({
    id: new Types.ObjectId().toHexString(),
    version: 0,
    price: 20,
    status: OrderStatus.Created,
    userId,
  });
  await order.save();
  await request(app)
    .post("/api/payments")
    .set("Cookie", signup())
    .send({ token: "a token", orderId: order.id })
    .expect(401);
});

it("should 400 if order is cancelled", async () => {
  const userId = new Types.ObjectId().toHexString();
  const order = Order.build({
    id: new Types.ObjectId().toHexString(),
    version: 0,
    price: 20,
    status: OrderStatus.Cancelled,
    userId,
  });
  await order.save();
  await request(app)
    .post("/api/payments")
    .set("Cookie", signup(userId))
    .send({ token: "a token", orderId: order.id })
    .expect(400);
});

it("should return 204", async () => {
  const userId = new Types.ObjectId().toHexString();
  const price = Math.floor(Math.random() * 10000);
  const order = Order.build({
    id: new Types.ObjectId().toHexString(),
    version: 0,
    price,
    status: OrderStatus.Created,
    userId,
  });
  await order.save();
  await request(app)
    .post("/api/payments")
    .set("Cookie", signup(userId))
    .send({ token: "tok_visa", orderId: order.id })
    .expect(201);
  const charges = await stripe.charges.list({ limit: 5 });
  const stripeCharge = charges.data.find(
    (charge) => charge.amount === price * 100
  );
  expect(stripeCharge).toBeDefined();
  expect(stripeCharge!.currency).toEqual("usd");

  const payment = await Payment.findOne({
    orderId: order.id,
    stripeId: stripeCharge!.id,
  });
  expect(payment).toBeTruthy();
});
