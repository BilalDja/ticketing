import request from 'supertest';
import {app} from '../../app';
import {Ticket} from "../../models/ticket";
import {Order, OrderStatus} from "../../models/order";
import {natsWrapper} from "../../nats-wrapper";
import {Types} from "mongoose";

describe('Cancel an order', () => {
    it('should cancel an order', async () => {
        const ticket = Ticket.build({
            id: new Types.ObjectId().toHexString(),
            title: 'Concerto',
            price: 12
        });
        await ticket.save();
        const userCookie = signup();

        const {body: order} = await request(app)
            .post('/api/orders')
            .set('Cookie', userCookie)
            .send({ticketId: ticket.id})
            .expect(201);

        await request(app)
            .delete(`/api/orders/${order.id}`)
            .set('Cookie', userCookie)
            .send()
            .expect(204);

        const updatedOrder = await Order.findById(order.id);
        expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
    });
    it('should emit order updated event', async () => {
        const ticket = Ticket.build({
            id: new Types.ObjectId().toHexString(),
            title: 'Concerto',
            price: 12
        });
        await ticket.save();
        const userCookie = signup();

        const {body: order} = await request(app)
            .post('/api/orders')
            .set('Cookie', userCookie)
            .send({ticketId: ticket.id})
            .expect(201);

        await request(app)
            .delete(`/api/orders/${order.id}`)
            .set('Cookie', userCookie)
            .send()
            .expect(204);
        expect(natsWrapper.client.publish).toHaveBeenCalled();
    });
});