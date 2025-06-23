import request from "supertest";
import {app} from "../../app";
import {createTicket, generateTicketObjectId} from "./utils";
import {natsWrapper} from "../../nats-wrapper";
import {Ticket} from "../../models/ticket";
import mongoose from "mongoose";

it(`returns a 404 if the provided id doesn't exist`, async (): Promise<void> => {
    const ticketId: string = generateTicketObjectId();
    await request(app)
        .put(`/api/tickets/${ticketId}`)
        .set('Cookie', global.signin())
        .send({
            title: 'MGK1',
            price: 200
        })
        .expect(404);

});

it('returns a 401 if user is not authenticated', async (): Promise<void> => {
    const createdTicket = await createTicket("MGK", 150);
    await request(app)
        .put(`/api/tickets/${createdTicket.body.id}`)
        .send({
            title: 'MGK1',
            price: 200
        })
        .expect(401);
});

it(`returns a 401 if user doesn't own the ticket`, async (): Promise<void> => {
    const createdTicket = await createTicket("MGK", 150);
    await request(app)
        .put(`/api/tickets/${createdTicket.body.id}`)
        .set('Cookie', global.signin()) // new cookie
        .send({
            title: 'MGK1',
            price: 200
        }).expect(401);
});

it('returns a 400 if user provides an invalid title or price', async (): Promise<void> => {
    const cookies: string[] = global.signin();
    const createdTicket = await createTicket("MGK", 150, cookies);
    await request(app)
        .put(`/api/tickets/${createdTicket.body.id}`)
        .set('Cookie', cookies) // new cookie
        .send({})
        .expect(400);

    await request(app)
        .put(`/api/tickets/${createdTicket.body.id}`)
        .set('Cookie', cookies) // new cookie
        .send({
            title: "MGK1"
        })
        .expect(400);

    await request(app)
        .put(`/api/tickets/${createdTicket.body.id}`)
        .set('Cookie', cookies) // new cookie
        .send({
            price: 200
        })
        .expect(400);
});

it('updates the ticket provided valid inputs', async (): Promise<void> => {
    const cookies: string[] = global.signin();
    const createdTicket = await createTicket("MGK", 150, cookies);
    const newTitle: string = 'Connor Price';
    const newPrice: number = 100;
    const result = await request(app)
        .put(`/api/tickets/${createdTicket.body.id}`)
        .set('Cookie', cookies) // new cookie
        .send({
            title: newTitle,
            price: newPrice
        })
        .expect(200);

    expect(result.body.title).toEqual(newTitle);
    expect(result.body.price).toEqual(newPrice);
});

it('publishes an event', async (): Promise<void> => {
    const cookies: string[] = global.signin();
    const createdTicket = await createTicket("MGK", 150, cookies);
    const newTitle: string = 'Connor Price';
    const newPrice: number = 100;
    const result = await request(app)
        .put(`/api/tickets/${createdTicket.body.id}`)
        .set('Cookie', cookies) // new cookie
        .send({
            title: newTitle,
            price: newPrice
        })
        .expect(200);

    expect(natsWrapper.client.publish).toHaveBeenCalled();
});

it("rejects updates if ticket is reserved", async (): Promise<void> => {
    const cookies: string[] = global.signin();
    const createdTicket = await createTicket("MGK", 150, cookies);

    const ticket = await Ticket.findById(createdTicket.body.id);
    ticket!.set({orderId: new mongoose.Types.ObjectId().toHexString()});
    await ticket!.save();

    const newTitle: string = 'Connor Price';
    const newPrice: number = 100;
    const result = await request(app)
        .put(`/api/tickets/${createdTicket.body.id}`)
        .set('Cookie', cookies) // new cookie
        .send({
            title: newTitle,
            price: newPrice
        })
        .expect(400);
});
