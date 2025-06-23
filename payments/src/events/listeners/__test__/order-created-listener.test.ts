import {OrderCreatedListener} from "../order-created-listener";
import {natsWrapper} from "../../../nats-wrapper";
import {OrderCreatedEvent, OrderStatus} from "@diamorph_tickets/common";
import mongoose from "mongoose";
import {Message} from "node-nats-streaming";
import {Order} from "../../../models/order";

const setup = async () => {
    const listener = new OrderCreatedListener(natsWrapper.client);

    const data: OrderCreatedEvent["data"] = {
        id: new mongoose.Types.ObjectId().toHexString(),
        userId: new mongoose.Types.ObjectId().toHexString(),
        status: OrderStatus.Created,
        expiresAt: new Date().toISOString(),
        ticket: {
            id: new mongoose.Types.ObjectId().toHexString(),
            price: 100
        },
        version: 0
    }

    // @ts-ignore
    const msg: Message = {
        ack: jest.fn(),
    }
    return {listener, data, msg};
};

it("replicates the order info", async () => {
    const {listener, data, msg} = await setup();

    await listener.onMessage(data, msg);

    const order = await Order.findById(data.id);

    expect(order!.id).toEqual(data.id);
    expect(order!.userId).toEqual(data.userId);
    expect(order!.status).toEqual(data.status);
    expect(order!.price).toEqual(data.ticket.price);
    expect(order!.version).toEqual(data.version);
});

it("acks the message", async () => {
    const {listener, data, msg} = await setup();

    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();
});