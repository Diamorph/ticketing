import {OrderCanceledListener} from "../order-canceled-listener";
import {natsWrapper} from "../../../nats-wrapper";
import mongoose from "mongoose";
import { Order } from "../../../models/order";
import {OrderCanceledEvent, OrderStatus} from "@diamorph_tickets/common";
import { Message } from "node-nats-streaming";

const setup = async () => {
    const listener: OrderCanceledListener = new OrderCanceledListener(natsWrapper.client);

    const order = Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        status: OrderStatus.Created,
        price: 150,
        userId: new mongoose.Types.ObjectId().toHexString(),
        version: 0
    });

    await order.save();

    const data: OrderCanceledEvent["data"] = {
        id: order.id,
        ticket: {
            id: new mongoose.Types.ObjectId().toHexString(),
        },
        version: order.version + 1
    };

    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }
    return {listener, data, order, msg};
};

it("cancels the order", async () => {
    const {listener, data, order, msg} = await setup();

    await listener.onMessage(data, msg);

    const updatedOrder = await Order.findById(data.id);

    expect(updatedOrder!.status).toEqual(OrderStatus.Canceled);
});
it("acks the message ", async () => {
    const {listener, data, order, msg} = await setup();

    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();
});