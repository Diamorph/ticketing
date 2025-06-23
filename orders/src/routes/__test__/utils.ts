import jwt from 'jsonwebtoken';
import {Ticket, TicketDoc} from "../../models/ticket";
import {OrderDoc, OrderStatus, Order} from "../../models/order";
import mongoose from "mongoose";

async function createTicket(title: string, price: number): Promise<TicketDoc> {
    const ticket: TicketDoc = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title,
        price
    });
    await ticket.save();

    return ticket;
}

async function createOrder(userId: string, status: OrderStatus, expiresAt: Date, ticket: TicketDoc): Promise<OrderDoc> {
    const order: OrderDoc = Order.build({
        userId,
        status,
        expiresAt,
        ticket
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

export {getUserIdFromCookies, createTicket, createOrder};
