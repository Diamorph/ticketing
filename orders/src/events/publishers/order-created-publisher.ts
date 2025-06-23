import {OrderCreatedEvent, Publisher, Subjects} from "@diamorph_tickets/common";

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
    readonly subject: Subjects.OrderCreated = Subjects.OrderCreated;
}