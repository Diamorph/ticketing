import {PaymentCreatedEvent, Publisher, Subjects} from "@diamorph_tickets/common";

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
    readonly subject: Subjects.PaymentCreated = Subjects.PaymentCreated;
}