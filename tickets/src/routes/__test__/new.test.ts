import request from "supertest";
import {app} from "../../app";
import {Ticket} from "../../models/ticket";
import {natsWrapper} from "../../nats-wrapper";

it("has a route handler listening to /api/tickets for post requests", async () => {
    const response = await request(app)
        .post("/api/tickets")
        .send({});

    expect(response.status).not.toEqual(404);
});

it("it can only be accessed if user is signed it", async () => {
    await request(app)
        .post("/api/tickets")
        .send()
        .expect(401);
});

it("returns a status other than 401 if the user is signed in", async () => {
    const response = await request(app)
        .post("/api/tickets")
        .set("Cookie", global.signin())
        .send();

    expect(response.status).not.toEqual(401);
});

it("it returns an error if an invalid title is provided", async () => {
    await request(app)
        .post("/api/tickets")
        .set("Cookie", global.signin())
        .send({
            title: "",
            price: 10
        })
        .expect(400);

    await request(app)
        .post("/api/tickets")
        .set("Cookie", global.signin())
        .send({
            price: 10
        })
        .expect(400);
});

it("it returns an error if an invalid price is provided", async () => {
    await request(app)
        .post("/api/tickets")
        .set("Cookie", global.signin())
        .send({
            title: "Title",
            price: -10
        })
        .expect(400);

    await request(app)
        .post("/api/tickets")
        .set("Cookie", global.signin())
        .send({
            title: "Title"
        })
        .expect(400);
});

it("creates a ticket with valid inputs", async () => {
    // add in a check to make sure a ticket was saved
    const ticketsCountBefore = await Ticket.countDocuments();
    expect(ticketsCountBefore).toBe(0);
    await request(app)
        .post("/api/tickets")
        .set("Cookie", global.signin())
        .send({
            title: "MGK",
            price: 150
        }).expect(201);
    const tickets = await Ticket.find({});
    expect(tickets.length).toEqual(1);
    expect(tickets[0].title).toEqual("MGK");
    expect(tickets[0].price).toEqual(150);
});

it('publishes an event', async () => {
    await request(app)
        .post("/api/tickets")
        .set("Cookie", global.signin())
        .send({
            title: "MGK",
            price: 150
        }).expect(201);

    expect(natsWrapper.client.publish).toHaveBeenCalled();
});
