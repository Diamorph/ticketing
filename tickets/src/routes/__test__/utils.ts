import Test from "supertest/lib/test";
import request from "supertest";
import {app} from "../../app";
import mongoose from "mongoose";

const createTicket = (title: string, price: number, cookie: string[] = global.signin()): Test => {
    return request(app)
        .post("/api/tickets")
        .set("Cookie", cookie)
        .send({
            title,
            price
        });
};

const generateTicketObjectId = (): string => {
    return new mongoose.Types.ObjectId().toHexString();
};

export {createTicket, generateTicketObjectId};