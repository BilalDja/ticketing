import {Request, Response, Router} from 'express';
import {NotAuthorizedError, NotFoundError, requireAuth} from "@djagotickets/common";
import {Ticket} from "../models/ticket";
import {Order, OrderStatus} from "../models/order";
import {OrderCancelledPublisher} from "../events/publishers/order-cancelled-publisher";
import {natsWrapper} from "../nats-wrapper";

const router = Router();

router.delete('/api/orders/:id', requireAuth, async (req: Request, res: Response) => {
    const order = await Order.findById(req.params.id).populate('ticket');
    if (!order) {
        throw new NotFoundError();
    }
    if (order.userId !== req.currentUser!.id) {
        throw new NotAuthorizedError();
    }
    order.status = OrderStatus.Cancelled;
    await order.save();

    new OrderCancelledPublisher(natsWrapper.client).publish({
        id: order.id,
        version: order.version,
        ticket: {
            id: order.ticket.id,
        }
    });

    res.status(204).send(order);
});

export {router as deleteOrderRouter};
