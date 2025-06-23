import request from "supertest";
import {app} from "../../app";
import mongoose from "mongoose";
import {createOrder, getUserIdFromCookies} from "./utils";
import {OrderStatus} from "@diamorph_tickets/common";
import {stripe} from "../../stripe";
import {Payment} from "../../models/payment";

it("returns a 404 if order doesn't exist", async () => {
    await request(app)
        .post("/api/payments")
        .set("Cookie", global.signin())
        .send({
            token: 'fdsfds',
            orderId: new mongoose.Types.ObjectId().toHexString(),
        }).expect(404);
});

it("returns a 401 when purchasing an order that doesnt belong to the user", async () => {
    const user1: string = getUserIdFromCookies(global.signin());
    const order = await createOrder(user1, OrderStatus.Created, 100, 0);

    await request(app)
        .post("/api/payments")
        .set("Cookie", global.signin())
        .send({
            token: 'fdsfds',
            orderId: order.id,
        }).expect(401);
});

it("returns a 400 when purchasing a canceled order", async () => {
    const user1Cookies: string[] = global.signin();
    const user1: string = getUserIdFromCookies(user1Cookies);
    const order = await createOrder(user1, OrderStatus.Canceled, 100, 0);

    await request(app)
        .post("/api/payments")
        .set("Cookie", user1Cookies)
        .send({
            token: 'fdsfds',
            orderId: order.id,
        }).expect(400);
});

it("returns a 201 with valid inputs", async () => {
    const userCookies: string[] = global.signin();
    const user: string = getUserIdFromCookies(userCookies);
    const order = await createOrder(user, OrderStatus.Created, 100, 0);
    const token: string = "tok_visa";
    await request(app)
        .post("/api/payments")
        .set("Cookie", userCookies)
        .send({
            token,
            orderId: order.id,
        }).expect(201);

    const chargeOptions = (stripe.charges.create as jest.Mock).mock.calls[0][0];

    expect(chargeOptions.currency).toEqual("USD");
    expect(chargeOptions.amount).toEqual(order.price * 100);
    expect(chargeOptions.source).toEqual(token);

    const payment = await Payment.findOne({orderId: order.id, stripeId: "test_id"});

    expect(payment).not.toBeNull();
});
