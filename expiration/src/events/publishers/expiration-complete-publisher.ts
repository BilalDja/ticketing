import {Publisher, ExpirationCompleteEvent, Subjects} from "@djagotickets/common";

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
    readonly subject = Subjects.ExpirationComplete;
}