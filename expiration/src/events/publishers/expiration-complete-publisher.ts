import {ExpirationCompleteEvent, Publisher, Subjects} from "@diamorph_tickets/common";

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
    readonly subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;
}