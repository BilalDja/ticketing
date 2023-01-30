import {Publisher, OrderCreatedEvent, Subjects} from "@djagotickets/common";

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
    readonly subject = Subjects.OrderCreated;
}