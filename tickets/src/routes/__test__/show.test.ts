import request from "supertest";
import {app} from "../../app";
import mongoose from "mongoose";

it("returns a 404 if the ticket is not found", async ()  => {
    const ticketId: string = new mongoose.Types.ObjectId().toHexString();
    await request(app)
        .get(`/api/tickets/${ticketId}`)
        .set("Cookie", global.signin())
        .send()
        .expect(404);
});

it("returns the ticket if the ticket is found", async ()  => {
    const title: string = "MGK";
    const price: number = 150;
    const ticketCreateResponse = await request(app)
        .post("/api/tickets")
        .set("Cookie", global.signin())
        .send({
            title,
            price,
        }).expect(201);

    const ticketResponse = await request(app)
        .get(`/api/tickets/${ticketCreateResponse.body.id}`)
        .set("Cookie", global.signin())
        .send()
        .expect(200);

    expect(ticketResponse.body.title).toEqual(title);
    expect(ticketResponse.body.price).toEqual(price);
});