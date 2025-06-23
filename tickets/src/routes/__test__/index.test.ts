import request from "supertest";
import {app} from "../../app";
import Test from "supertest/lib/test";

const createTicket = (title: string, price: number): Test => {
    return request(app)
        .post("/api/tickets")
        .set("Cookie", global.signin())
        .send({
            title,
            price
        });
};

it('can fetch a list of tickets', async (): Promise<void> => {
    await createTicket("MGK", 100).expect(201);
    await createTicket("Connor Price", 150).expect(201);
    await createTicket("Eminem", 200).expect(201);

    const response = await request(app)
        .get('/api/tickets')
        .send()
        .expect(200);

    expect(response.body.length).toEqual(3);
});