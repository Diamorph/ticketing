import {TicketCreatedListener} from "../ticket-created-listener";
import {natsWrapper} from "../../../nats-wrapper";
import {TicketCreatedEvent} from "@diamorph_tickets/common";
import mongoose from "mongoose";
import {Message} from "node-nats-streaming";
import {Ticket} from "../../../models/ticket";

const setup = async () => {
    // create an instance of a listener
    const listener: TicketCreatedListener = new TicketCreatedListener(natsWrapper.client);

    // create a fake event

    const ticketCreatedEvent: TicketCreatedEvent["data"] = {
        version: 0,
        id: new mongoose.Types.ObjectId().toHexString(),
        title: "MGK",
        price: 100,
        userId: new mongoose.Types.ObjectId().toHexString()
    };

    // create a fake message object
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn(),
    };
    return {listener, ticketCreatedEvent, msg};
};


it("creates and saves a ticket", async () => {
    const {listener, ticketCreatedEvent, msg} = await setup();
    // call the onMessage function with the data object + message object

    await listener.onMessage(ticketCreatedEvent, msg);

    // write assertion to make sure a ticket was created
    const ticket = await Ticket.findById(ticketCreatedEvent.id);

    expect(ticket).toBeDefined();
    expect(ticket!.title).toEqual(ticketCreatedEvent.title);
    expect(ticket!.price).toEqual(ticketCreatedEvent.price);
});

it("acks the message", async () => {

    const {listener, ticketCreatedEvent, msg} = await setup();
    // call the onMessage function with the data object + message object

    await listener.onMessage(ticketCreatedEvent, msg);

    // write an assertion to make sure ack function is called
    expect(msg.ack).toHaveBeenCalled();
});

