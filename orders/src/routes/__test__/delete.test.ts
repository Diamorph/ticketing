import {TicketDoc} from "../../models/ticket";
import {createTicket} from "./utils";
import request from "supertest";
import {app} from "../../app";
import {Order, OrderStatus} from "../../models/order";
import {natsWrapper} from "../../nats-wrapper";

it('marks an order as canceled', async () => {
    // Create a ticket
    const ticket: TicketDoc = await createTicket("MGK", 150);

    const cookie: string[] = global.signin();

    // make a request to build an order with this ticket
    const {body: order} = await request(app)
        .post("/api/orders")
        .set("Cookie", cookie)
        .send({ticketId: ticket.id}).expect(201);

    // make request to cancel the order
    await request(app)
        .delete(`/api/orders/${order.id}`)
        .set("Cookie", cookie)
        .send()
        .expect(204);

    const updatedOrder = await Order.findById(order.id);
    expect(updatedOrder!.status).toEqual(OrderStatus.Canceled);
});

it("emits a order canceled event", async () => {
    const ticket: TicketDoc = await createTicket("MGK", 150);

    const cookie: string[] = global.signin();

    // make a request to build an order with this ticket
    const {body: order} = await request(app)
        .post("/api/orders")
        .set("Cookie", cookie)
        .send({ticketId: ticket.id}).expect(201);

    // make request to cancel the order
    await request(app)
        .delete(`/api/orders/${order.id}`)
        .set("Cookie", cookie)
        .send()
        .expect(204);

    expect(natsWrapper.client.publish).toHaveBeenCalled();
});