import {Message} from 'node-nats-streaming';
import {Listener, Subjects, TicketCreatedEvent} from "@djagotickets/common";
import {queueGroupName} from "./queue-group-name";
import {Ticket} from "../../models/ticket";

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
    readonly subject = Subjects.TicketCreated;
    queueGroupName = queueGroupName;

    async onMessage(data: TicketCreatedEvent["data"], msg: Message) {
        // Create a ticket
        const {id, title, price} = data;
        const ticket = Ticket.build({id, title, price});
        await ticket.save();
        msg.ack();
    }
}