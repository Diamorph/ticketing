import {ExpirationCompleteListener} from "../expiration-complete-listener";
import {natsWrapper} from "../../../nats-wrapper";
import {ExpirationCompleteEvent, OrderStatus} from "@diamorph_tickets/common";
import mongoose from "mongoose";
import {Ticket} from "../../../models/ticket";
import {Order} from "../../../models/order";

const setup = async () => {
    const listener: ExpirationCompleteListener = new ExpirationCompleteListener(natsWrapper.client);

    const ticketId: string = new mongoose.Types.ObjectId().toHexString();

    const ticket = Ticket.build({
        id: ticketId,
        title: "MGK",
        price: 100,
    });

    await ticket.save();

    const order = Order.build({
        userId: new mongoose.Types.ObjectId().toHexString(),
        status: OrderStatus.Created,
        expiresAt: new Date(),
        ticket
    });

    await order.save();

    const expirationCompleteEvent: ExpirationCompleteEvent["data"] = {
        orderId: order.id
    };

    // @ts-ignore
    const msg: Message = {
        ack: jest.fn(),
    }

    return {listener, order, ticket, expirationCompleteEvent, msg};
};

it("updates the order status to canceled", async () => {
    const {listener, order, ticket, expirationCompleteEvent, msg} = await setup();

    await listener.onMessage(expirationCompleteEvent, msg);

    const updatedOrder = await Order.findById(order.id);

    expect(updatedOrder!.status).toEqual(OrderStatus.Canceled);
});


it("emits order canceled event", async () => {
    const {listener, order, ticket, expirationCompleteEvent, msg} = await setup();

    await listener.onMessage(expirationCompleteEvent, msg);

    expect(natsWrapper.client.publish).toHaveBeenCalled();

    const eventData = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1]);
    expect(eventData.id).toEqual(order.id);
});


it("acks the message", async () => {
    const {listener, order, ticket, expirationCompleteEvent, msg} = await setup();

    await listener.onMessage(expirationCompleteEvent, msg);

    expect(msg.ack).toHaveBeenCalled();
});