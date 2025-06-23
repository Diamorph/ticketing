import {Publisher, Subjects, TicketUpdatedEvent} from "@diamorph_tickets/common";

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
    readonly subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
}