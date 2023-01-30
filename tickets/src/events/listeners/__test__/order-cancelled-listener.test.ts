import {natsWrapper} from "../../../nats-wrapper";
import {Ticket} from "../../../models/ticket";
import {OrderCancelledEvent} from "@djagotickets/common";
import {Message} from "node-nats-streaming";
import {Types} from "mongoose";
import {OrderCancelledListener} from "../order-cancelled-listener";

const setup = async () => {
    const listener = new OrderCancelledListener(natsWrapper.client);
    const orderId = new Types.ObjectId().toHexString();
    const ticket = Ticket.build({
        title: 'Random',
        price: 99,
        userId: 'abcd',
    });
    ticket.set({orderId});
    await ticket.save();

    const data: OrderCancelledEvent['data'] = {
        id: orderId,
        version: 1,
        ticket: {
            id: ticket.id,
        }
    };

    //@ts-ignore
    const msg: Message = {
        ack: jest.fn(),
    };

    return {listener, data, ticket, msg};
}

it('should updates a ticket, publishes an event and ack the message', async () => {
    const {ticket, data, msg, listener} = await setup();
    await listener.onMessage(data, msg);

    const updatedTicket = await Ticket.findById(ticket.id);
    expect(updatedTicket!.orderId).toBeUndefined();
    expect(msg.ack).toBeCalled();
    expect(natsWrapper.client.publish).toBeCalled();
}); 
