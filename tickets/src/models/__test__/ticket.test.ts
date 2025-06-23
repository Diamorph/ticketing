import { Ticket } from "../ticket";
import mongoose from "mongoose";

it('implements optimistic concurrency control', async () => {
    // Create an instance of a ticket
    const ticket = Ticket.build({
        title: "MGK",
        price: 10,
        userId: new mongoose.Types.ObjectId().toHexString(),
    });

    // Save the ticket to the database

    await ticket.save();

    // fetch the ticket twice
    const firstInstance = await Ticket.findById(ticket.id);

    const secondInstance = await Ticket.findById(ticket.id);
    // make two separate changes to the tickets we fetched

    firstInstance!.set({price: 15});
    secondInstance!.set({price: 20});

    // save the first fetched ticket
    await firstInstance!.save();

    // save the second fetched ticket
    try {
        await secondInstance!.save();
    } catch (err) {
        return;
    }

    throw new Error("Should not reach this point");
});

it("increments the version number on multiple saves", async () => {
    const ticket = Ticket.build({
        title: "MGK",
        price: 10,
        userId: new mongoose.Types.ObjectId().toHexString(),
    });

    await ticket.save();

    expect(ticket.version).toEqual(0);

    await ticket.save();

    expect(ticket.version).toEqual(1);

    await ticket.save();

    expect(ticket.version).toEqual(2);
});