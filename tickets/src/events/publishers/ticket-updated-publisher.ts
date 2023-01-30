import { Publisher, Subjects, TicketUpdatedEvent } from "@djagotickets/common";

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdated;
}
