import { ExpirationCompleteEvent } from "@djagotickets/common";
import { Types } from "mongoose";
import { Message } from "node-nats-streaming";
import { Order, OrderStatus } from "../../../models/order";
import { Ticket } from "../../../models/ticket";
import { natsWrapper } from "../../../nats-wrapper";
import { ExpirationCompleteListener } from "../expiration-complete-listener";
const setup = async () => {
  const listener = new ExpirationCompleteListener(natsWrapper.client);
  const ticket = Ticket.build({
    id: new Types.ObjectId().toHexString(),
    title: "Title",
    price: 20,
  });
  await ticket.save();
  const order = Order.build({
    ticket,
    userId: "iaudoiauzd",
    expiresAt: new Date(),
    status: OrderStatus.Created,
  });
  await order.save();

  const data: ExpirationCompleteEvent["data"] = { orderId: order.id };
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };
  return { listener, data, msg, ticket, order };
};

it("should updates the order status to cancelled", async () => {
  const { listener, data, ticket, order, msg } = await setup();
  await listener.onMessage(data, msg);
  const updatedOrder = await Order.findById(order.id);
  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it("should emits an OrderCancelled event", async () => {
  const { listener, data, ticket, order, msg } = await setup();
  await listener.onMessage(data, msg);
  expect(natsWrapper.client.publish).toBeCalled();
  const eventData = JSON.parse(
    (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
  );
  expect(eventData.id).toEqual(order.id);
});

it("should ack the message", async () => {
  const { listener, data, ticket, order, msg } = await setup();
  await listener.onMessage(data, msg);
  expect(msg.ack).toBeCalled();
});