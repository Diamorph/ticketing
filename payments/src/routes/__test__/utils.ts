import {Order} from "../../models/order";
import mongoose from "mongoose";
import {OrderStatus} from "@diamorph_tickets/common";
import jwt from "jsonwebtoken";

async function createOrder(userId: string, status: OrderStatus, price: number, version: number) {
    const order = Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        userId,
        status,
        price,
        version,
    });

    await order.save();
    return order;
}

function getUserIdFromCookies(cookies: string[]): string {
    const cookie: string = cookies[0].split("=")[1];
    const decodedCookie = JSON.parse(Buffer.from(cookie, "base64").toString("utf-8"));
    const jwtPayload = jwt.decode(decodedCookie.jwt, {json: true});
    if (!jwtPayload) {
        throw new Error('Could not decode JWT');
    }
    return jwtPayload.id;
}

export {getUserIdFromCookies, createOrder}