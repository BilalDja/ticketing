import { Publisher, Subjects, TicketCreatedEvent } from "@djagotickets/common";

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated;
}
