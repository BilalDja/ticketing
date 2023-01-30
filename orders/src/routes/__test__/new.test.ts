import request from 'supertest';
import {app} from '../../app';
import {Types} from "mongoose";
import {Ticket} from "../../models/ticket";
import {Order, OrderStatus} from "../../models/order";
import {natsWrapper} from "../../nats-wrapper";

describe('New Order', () => {
    it('should returns 404 if the ticket does not exist', async () => {
        const ticketId = new Types.ObjectId();
        await request(app)
            .post('/api/orders')
            .set('Cookie', signup())
            .send({ticketId})
            .expect(404);

    });

    it('should returns error if the ticket is reserved', async () => {
        const ticket = Ticket.build({
            id: new Types.ObjectId().toHexString(),
            title: 'Event',
            price: 30,
        });
        await ticket.save();
        const order = Order.build({
            ticket,
            userId: 'fozjefoizejf',
            expiresAt: new Date(),
            status: OrderStatus.AwaitingPayment,
        });
        await order.save();
        await request(app)
            .post('/api/orders')
            .set('Cookie', signup())
            .send({ticketId: ticket.id})
            .expect(400);
    });

    it('reserves a ticket', async () => {
        const ticket = Ticket.build({
            id: new Types.ObjectId().toHexString(),
            title: 'Event',
            price: 30,
        });
        await ticket.save();
        await request(app)
            .post('/api/orders')
            .set('Cookie', signup())
            .send({ticketId: ticket.id})
            .expect(201);
    });

    it('should emits an order created event', async () => {
        const ticket = Ticket.build({
            id: new Types.ObjectId().toHexString(),
            title: 'Event',
            price: 30,
        });
        await ticket.save();
        await request(app)
            .post('/api/orders')
            .set('Cookie', signup())
            .send({ticketId: ticket.id})
            .expect(201);
        expect(natsWrapper.client.publish).toHaveBeenCalled();
    });
});