import {natsWrapper} from "../../../nats-wrapper";
import {TicketUpdatedListener} from "../ticket-updated-listener";
import {TicketUpdatedEvent} from "@diamorph_tickets/common";
import mongoose from "mongoose";
import {Message} from "node-nats-streaming";
import {Ticket} from "../../../models/ticket";

const setup = async () => {

    // create an instance of a listener
    const listener: TicketUpdatedListener = new TicketUpdatedListener(natsWrapper.client);

    // create and save a ticket

    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: "MGK",
        price: 200
    });

    await ticket.save();
    // create a fake event

    const ticketUpdatedEvent: TicketUpdatedEvent["data"] = {
        id: ticket.id,
        title: "Connor Price",
        price: 150,
        userId: new mongoose.Types.ObjectId().toHexString(),
        version: ticket.version + 1
    };

    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }

    return {listener, ticketUpdatedEvent, msg}
};

it("finds, updates and saves a ticket", async () => {
    const {listener, ticketUpdatedEvent, msg} = await setup();

    await listener.onMessage(ticketUpdatedEvent, msg);

    const ticket = await Ticket.findById(ticketUpdatedEvent.id);

    expect(ticket).toBeDefined();
    expect(ticket!.title).toEqual(ticketUpdatedEvent.title);
    expect(ticket!.price).toEqual(ticketUpdatedEvent.price);
    expect(ticket!.version).toEqual(ticketUpdatedEvent.version);
});

it("acks the message", async () => {
    const {listener, ticketUpdatedEvent, msg} = await setup();

    await listener.onMessage(ticketUpdatedEvent, msg);

    expect(msg.ack).toHaveBeenCalled();
});

it("does not call ack if the event has a skipped version number", async () => {

    const {listener, ticketUpdatedEvent, msg} = await setup();

    ticketUpdatedEvent.version = 10;

    try {
        await listener.onMessage(ticketUpdatedEvent, msg);
    } catch (error) {}

    expect(msg.ack).not.toHaveBeenCalled();
});