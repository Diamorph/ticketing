import request from "supertest";
import {app} from "../../app";

it("responds with details about current user", async () => {

    const cookie = await global.signin();

    const response = await request(app)
        .get("/api/users/currentUser")
        .set("Cookie", cookie)
        .send()
        .expect(200);

    expect(response.body.currentUser.email).toEqual("test@test.com");
});

it("responds with null if not authenticated", async () => {
    await request(app)
        .get("/api/users/currentUser")
        .send()
        .expect(401);
});
