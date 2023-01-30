import request from 'supertest';
import {app} from '../../app';
import {Ticket} from "../../models/ticket";
import {Types} from "mongoose";

describe('FInd an Order', () => {
    it('should fetch an order', async () => {
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

        const {body} = await request(app)
            .get(`/api/orders/${order.id}`)
            .set('Cookie', userCookie)
            .send()
            .expect(200);
        expect(body.id).toEqual(order.id);
    });

    it('should returns error if user tries to fetch other user is order', async () => {
        const ticket = Ticket.build({
            id: new Types.ObjectId().toHexString(),
            title: 'Concerto',
            price: 12
        });
        await ticket.save();
        const userCookie = signup();
        const userTwo = signup();

        const {body: order} = await request(app)
            .post('/api/orders')
            .set('Cookie', userCookie)
            .send({ticketId: ticket.id})
            .expect(201);

        await request(app)
            .get(`/api/orders/${order.id}`)
            .set('Cookie', userTwo)
            .send()
            .expect(401);
    });
});