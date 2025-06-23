import request from "supertest";
import {app} from "../../app";
import {createTicket} from "./utils";
import {TicketDoc} from "../../models/ticket";

it("fetches the order", async () => {
    // Create a ticket
    const ticket: TicketDoc = await createTicket("MGK", 150);

    const cookie: string[] = global.signin();

    // make a request to build an order with this ticket
    const {body: order} = await request(app)
        .post("/api/orders")
        .set("Cookie", cookie)
        .send({ticketId: ticket.id}).expect(201);

    // make request to fetch the order
    const {body: fetchedOrder} = await request(app)
        .get(`/api/orders/${order.id}`)
        .set("Cookie", cookie)
        .send()
        .expect(200);

    expect(fetchedOrder.id).toEqual(order.id);
    expect(fetchedOrder.ticket.id).toEqual(ticket.id);
});

it("returns an error if one user tries to fetch another users order", async () => {
    // Create a ticket
    const ticket: TicketDoc = await createTicket("MGK", 150);

    const user1: string[] = global.signin();
    const user2: string[] = global.signin();

    // make a request to build an order with this ticket
    const {body: order} = await request(app)
        .post("/api/orders")
        .set("Cookie", user1)
        .send({ticketId: ticket.id}).expect(201);

    // make request to fetch the order
    await request(app)
        .get(`/api/orders/${order.id}`)
        .set("Cookie",user2)
        .send()
        .expect(401);
});