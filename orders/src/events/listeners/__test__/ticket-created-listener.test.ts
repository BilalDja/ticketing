import {TicketCreatedListener} from "../ticket-created-listener";
import {natsWrapper} from "../../../nats-wrapper";
import {TicketCreatedEvent} from "@djagotickets/common";
import {Types} from "mongoose";
import {Message} from "node-nats-streaming";
import {Ticket} from "../../../models/ticket";

const setup = async () => {
    const listener = new TicketCreatedListener(natsWrapper.client);

    const data: TicketCreatedEvent['data'] = {
        id: new Types.ObjectId().toHexString(),
        version: 0,
        title: 'Documentary',
        price: 9.99,
        userId: new Types.ObjectId().toHexString(),
    };

    //@ts-ignore
    const msg: Message = {
        ack: jest.fn(),
    };
    return {listener, data, msg};
};

it('should create and save a ticket', async () => {
    const {listener, data, msg} = await setup();
    await listener.onMessage(data, msg);
    const ticket = await Ticket.findById(data.id);
    // Make sure the ticket was created
    expect(ticket).toBeTruthy();
    expect(ticket!.id).toEqual(data.id);
    expect(ticket!.title).toEqual(data.title);
    expect(ticket!.price).toEqual(data.price);
});

it('should acks the message', async () => {
    const {listener, data, msg} = await setup();
    await listener.onMessage(data, msg);
    // Make sure the ack function was invoked
    expect(msg.ack).toHaveBeenCalled();
}); 