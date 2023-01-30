import { Publisher, PaymentCreatedEvent, Subjects } from "@djagotickets/common";

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  readonly subject = Subjects.PaymentCreated;
}
