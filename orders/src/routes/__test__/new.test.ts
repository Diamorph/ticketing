import request from "supertest";
import {app} from "../../app";
import mongoose from "mongoose";
import {Order, OrderStatus} from "../../models/order";
import {createTicket} from "./utils";
import {natsWrapper} from "../../nats-wrapper";

it('returns an error if the ticker does not exist', async () => {
    const ticketId = new mongoose.Types.ObjectId();
    await request(app)
        .post("/api/orders")
        .set('Cookie', global.signin())
        .send({ticketId: ticketId}).expect(404);
});

it('returns an error if the ticker already reserved', async () => {
    const ticket = await createTicket("Connor Price", 150);

    const order = Order.build({
        ticket,
        userId: 'testId',
        status: OrderStatus.Created,
        expiresAt: new Date()
    });

    await order.save();

    await request(app)
        .post("/api/orders")
        .set('Cookie', global.signin())
        .send({ticketId: ticket.id}).expect(400);
});

it('reserves a ticket', async () => {
    const ticket = await createTicket("Connor Price", 150);

    await request(app)
        .post("/api/orders")
        .set('Cookie', global.signin())
        .send({ticketId: ticket.id}).expect(201);
});


it("emits an order created event", async () => {
    const ticket = await createTicket("MGK", 100);
    await request(app)
        .post("/api/orders")
        .set('Cookie', global.signin())
        .send({ticketId: ticket.id}).expect(201);

    expect(natsWrapper.client.publish).toHaveBeenCalled();
});