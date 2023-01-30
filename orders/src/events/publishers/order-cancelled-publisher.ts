import {Publisher, OrderCancelledEvent, OrderCreatedEvent, Subjects} from "@djagotickets/common";

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
    readonly subject = Subjects.OrderCancelled;
}