import {TicketUpdatedListener} from "../ticket-updated-listener";
import {natsWrapper} from "../../../nats-wrapper";
import {TicketUpdatedEvent} from "@djagotickets/common";
import {Types} from "mongoose";
import {Ticket} from "../../../models/ticket";
import {Message} from "node-nats-streaming";

const setup = async () => {
    const listener = new TicketUpdatedListener(natsWrapper.client);
    const ticket = Ticket.build({
        id: new Types.ObjectId().toHexString(),
        title: 'Ticket Title',
        price: 22.5,
    });
    await ticket.save();
    const data: TicketUpdatedEvent['data'] = {
        id: ticket.id,
        version: ticket.version + 1,
        title: 'New Ticket Title',
        price: 23.5,
        userId: 'kzadazndobv'
    };
    //@ts-ignore
    const msg: Message = {
        ack: jest.fn(),
    }

    return {msg, data, ticket, listener};
};

it('should finds, updates and saves a ticket', async () => {
    const {ticket, data, msg, listener} = await setup();
    await listener.onMessage(data, msg);
    const updatedTicket = await Ticket.findById(ticket.id);

    expect(updatedTicket!.title).toEqual(data.title);
    expect(updatedTicket!.price).toEqual(data.price);
    expect(updatedTicket!.version).toEqual(data.version);
});

it('should acks the message', async () => {
    const {data, msg, listener} = await setup();
    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();
});

it('should not call ack if the version is out of order', async () => {
    const {data, msg, listener} = await setup();
    data.version++;
    await expect(listener.onMessage(data, msg)).rejects.toThrow();
    expect(msg.ack).not.toHaveBeenCalled();
});