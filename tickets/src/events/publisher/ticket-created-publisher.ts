import {Publisher, Subjects, TicketCreatedEvent} from "@diamorph_tickets/common";

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
    readonly subject: Subjects.TicketCreated = Subjects.TicketCreated;
}