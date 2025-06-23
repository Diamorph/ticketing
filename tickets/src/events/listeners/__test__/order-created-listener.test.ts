import {Ticket} from "../../../models/ticket";
import {natsWrapper} from "../../../nats-wrapper";
import {OrderCreatedListener} from "../order-created-listener";
import mongoose from "mongoose";
import {OrderCreatedEvent, OrderStatus} from "@diamorph_tickets/common";
import {Message} from "node-nats-streaming";

const setup = async () => {
    const listener: OrderCreatedListener = new OrderCreatedListener(natsWrapper.client);

    const ticket = Ticket.build({
        title: "Connor Price",
        price: 150,
        userId: new mongoose.Types.ObjectId().toHexString(),
    });

    await ticket.save();

    const expirationDate: Date = new Date();
    expirationDate.setMinutes(expirationDate.getMinutes() + 15);

    const orderCreatedEvent: OrderCreatedEvent["data"] = {
        id: new mongoose.Types.ObjectId().toHexString(),
        status: OrderStatus.Created,
        userId: new mongoose.Types.ObjectId().toHexString(),
        expiresAt: expirationDate.toISOString(),
        ticket: {
            id: ticket.id,
            price: ticket.price
        },
        version: 1
    }

    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }
    return {listener, ticket, orderCreatedEvent, msg};
};

it("sets the userId of the ticket", async () => {
    const {listener, ticket, orderCreatedEvent, msg} = await setup();

    await listener.onMessage(orderCreatedEvent, msg);

    const updatedTicket = await Ticket.findById(ticket.id);

    expect(updatedTicket).toBeDefined();
    expect(updatedTicket!.orderId).toEqual(orderCreatedEvent.id);
});

it("acks the message", async () => {
    const {listener, ticket, orderCreatedEvent, msg} = await setup();

    await listener.onMessage(orderCreatedEvent, msg);

    expect(msg.ack).toHaveBeenCalled();
});

it("publishes a ticket updated event", async () => {
    const {listener, ticket, orderCreatedEvent, msg} = await setup();

    await listener.onMessage(orderCreatedEvent, msg);

    expect(natsWrapper.client.publish).toHaveBeenCalled();

    const ticketUpdateData = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1]);

    expect(ticketUpdateData.orderId).toEqual(orderCreatedEvent.id);
});