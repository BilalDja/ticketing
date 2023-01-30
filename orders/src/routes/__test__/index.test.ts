import request from 'supertest';
import {app} from '../../app';
import {Order} from "../../models/order";
import {Ticket} from "../../models/ticket";
import {Types} from "mongoose";

const buildTicket = async () => {
  const ticket = Ticket.build({
      id: new Types.ObjectId().toHexString(),
      title: 'Super Meeting',
      price: 300,
  });
  await ticket.save();
  return ticket;
}

const createOrder = async (userCookie: string[], ticketId: string) => {
    return request(app)
        .post('/api/orders')
        .set('Cookie', userCookie)
        .send({ticketId})
        .expect(201);
}

describe('Find Orders', () => {
    it('should fetches orders for a particular user', async () => {
        const ticketOne = await buildTicket();
        const ticketTwo = await buildTicket();
        const ticketThree = await buildTicket();

        const userOne = signup();
        const userTwo = signup();

        // User One Order
        await createOrder(userOne, ticketOne.id);

        // User Two Orders
        const {body: orderOne} = await createOrder(userTwo, ticketTwo.id);
        const {body: orderTwo} = await createOrder(userTwo, ticketThree.id);

        const {body} = await request(app)
            .get('/api/orders')
            .set('Cookie', userTwo)
            .send()
            .expect(200);
        expect(body.length).toEqual(2);
        expect(body[0].id).toEqual(orderOne.id);
        expect(body[1].id).toEqual(orderTwo.id);
        expect(body[0].ticket.id).toEqual(ticketTwo.id);
        expect(body[1].ticket.id).toEqual(ticketThree.id);
    });
})