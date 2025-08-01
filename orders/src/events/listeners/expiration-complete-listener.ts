import {ExpirationCompleteEvent, Listener, OrderStatus, Subjects} from "@diamorph_tickets/common";
import {queueGroupName} from "./queue-group-name";
import {Message} from "node-nats-streaming";
import {Order} from "../../models/order";
import {OrderCanceledPublisher} from "../publishers/order-canceled-publisher";

export class ExpirationCompleteListener extends Listener<ExpirationCompleteEvent> {
    readonly subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;
    readonly queueGroupName: string = queueGroupName;

    async onMessage(data: ExpirationCompleteEvent["data"], msg: Message) {
        const order = await Order.findById(data.orderId).populate("ticket");

        if (!order) {
            throw new Error("Order not found");
        }

        if (order.status === OrderStatus.Complete) {
            return msg.ack();
        }

        order.set({
            status: OrderStatus.Canceled
        });

        await order.save();

        await new OrderCanceledPublisher(this.client).publish({
            id: order.id,
            ticket: {
                id: order.ticket.id
            },
            version: order.version
        });

        msg.ack();
    }
}