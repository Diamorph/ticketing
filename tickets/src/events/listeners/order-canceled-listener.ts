import {Listener, OrderCanceledEvent, Subjects} from "@diamorph_tickets/common";
import {Message} from "node-nats-streaming";
import {queueGroupName} from "./queue-group-name";
import {Ticket} from "../../models/ticket";
import {TicketUpdatedPublisher} from "../publisher/ticket-updated-publisher";

export class OrderCanceledListener extends Listener<OrderCanceledEvent>{
    readonly subject: Subjects.OrderCanceled = Subjects.OrderCanceled;
    readonly queueGroupName = queueGroupName;
    async onMessage(data: OrderCanceledEvent["data"], msg: Message) {

        const ticket = await Ticket.findById(data.ticket.id);

        if (!ticket) {
            throw new Error("Ticket not found");
        }

        ticket.set({orderId: undefined});

        await ticket.save();

        await new TicketUpdatedPublisher(this.client).publish({
            id: ticket.id,
            title: ticket.title,
            price: ticket.price,
            userId: ticket.userId,
            version: ticket.version,
            orderId: ticket.orderId
        });

        msg.ack();
    }
}