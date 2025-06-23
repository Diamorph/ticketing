import {OrderCanceledListener} from "../order-canceled-listener";
import {natsWrapper} from "../../../nats-wrapper";
import {Ticket} from "../../../models/ticket";
import mongoose from "mongoose";
import {OrderCanceledEvent} from "@diamorph_tickets/common";
import {Message} from "node-nats-streaming";

const setup = async () => {
    const listener = new OrderCanceledListener(natsWrapper.client);

    const orderId: string = new mongoose.Types.ObjectId().toHexString();
    const ticket = Ticket.build({
        title: "MGK",
        price: 20,
        userId: new mongoose.Types.ObjectId().toHexString()
    });
    ticket.set({orderId});

    await ticket.save();

    const orderCanceledEvent: OrderCanceledEvent["data"] = {
        id: orderId,
        ticket: {
            id: ticket.id,
        },
        version: 0
    }
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    };


    return {listener, ticket, orderCanceledEvent, orderId, msg};
};

it("updates the ticket, publishes an event and acks the message", async () => {
    const {listener, ticket, orderCanceledEvent, orderId, msg} = await setup();

    await listener.onMessage(orderCanceledEvent, msg);

    const updatedTicket = await Ticket.findById(ticket.id);

    expect(updatedTicket!.orderId).toBeUndefined();
    expect(msg.ack).toHaveBeenCalled();
    expect(natsWrapper.client.publish).toHaveBeenCalled();
});

