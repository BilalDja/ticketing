import {OrderCreateListener} from "../order-create-listener";
import {natsWrapper} from "../../../nats-wrapper";
import {Ticket} from "../../../models/ticket";
import {OrderCreatedEvent, OrderStatus} from "@djagotickets/common";
import {Message} from "node-nats-streaming";
import {Types} from "mongoose";

const setup = async () => {
    const listener = new OrderCreateListener(natsWrapper.client);
    const ticket = Ticket.build({
        title: 'Random',
        price: 99,
        userId: 'abcd',
    });
    await ticket.save();

    const data: OrderCreatedEvent['data'] = {
        id: new Types.ObjectId().toHexString(),
        version: 0,
        status: OrderStatus.Created,
        userId: 'adasd',
        expiresAt: 'dakdka,zd',
        ticket: {
            id: ticket.id,
            price: ticket.price,
        }
    };

    //@ts-ignore
    const msg: Message = {
        ack: jest.fn(),
    };

    return {listener, data, ticket, msg};
}
it('should sets the orderId of the ticket', async () => {
    const {ticket, data, msg, listener} = await setup();
    await listener.onMessage(data, msg);

    const updatedTicket = await Ticket.findById(ticket.id);
    expect(updatedTicket!.orderId).toEqual(data.id);
});

it('should ack the message', async () => {
    const {ticket, data, msg, listener} = await setup();
    await listener.onMessage(data, msg);
    expect(msg.ack).toBeCalled();
});

it('should publishes a ticket update event', async () => {
    const {ticket, data, msg, listener} = await setup();
    await listener.onMessage(data, msg);
    expect(natsWrapper.client.publish).toHaveBeenCalled();
    const ticketUpdatedData = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1]);
    expect(data.id).toEqual(ticketUpdatedData.orderId);
}); 
