import {OrderCanceledEvent, Publisher, Subjects} from "@diamorph_tickets/common";

export class OrderCanceledPublisher extends Publisher<OrderCanceledEvent> {
    readonly subject: Subjects.OrderCanceled = Subjects.OrderCanceled;
}