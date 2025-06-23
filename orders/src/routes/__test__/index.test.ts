import {TicketDoc} from "../../models/ticket";
import {createTicket} from "./utils";
import request from "supertest";
import {app} from "../../app";

it("fetch orders for an particular user", async () => {
    // Create three tickets
    const ticket1: TicketDoc = await createTicket("MGK", 100);
    const ticket2: TicketDoc = await createTicket("Connor Price", 150);
    const ticket3: TicketDoc = await createTicket("Shakira", 200);

    // Create users

    const userOne: string[] = global.signin();
    const userTwo: string[] = global.signin();
    // Create one order as User #1
    await request(app)
        .post("/api/orders")
        .set("Cookie", userOne)
        .send({ticketId: ticket1.id});
    // Create one order as User #2
    await request(app)
        .post("/api/orders")
        .set("Cookie", userTwo)
        .send({ticketId: ticket2.id});

    await request(app)
        .post("/api/orders")
        .set("Cookie", userTwo)
        .send({ticketId: ticket3.id});

    // Another approach with creation order directly
    // const order1: OrderDoc = await createOrder("test", OrderStatus.Created, new Date(), ticket1);
    // const cookies: string[] = global.signin();
    // const userId: string = getUserIdFromCookies(cookies);
    // const order2: OrderDoc = await createOrder(userId, OrderStatus.Created, new Date(), ticket2);
    // const order3: OrderDoc = await createOrder(userId, OrderStatus.Created, new Date(), ticket3);
    // Make request to get orders for User #2

    const ordersResponse = await request(app)
        .get("/api/orders")
        .set("Cookie", userTwo)
        .expect(200);

    const orders = ordersResponse.body;
    // Make sure we only got the orders for User #2
    expect(orders.length).toEqual(2);
    expect(orders[0].ticket.id).toEqual(ticket2.id);
    expect(orders[1].ticket.id).toEqual(ticket3.id);
});