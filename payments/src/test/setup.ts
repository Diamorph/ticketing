import {MongoMemoryServer} from "mongodb-memory-server";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

jest.mock("../nats-wrapper");
jest.mock("../stripe");

let mongo: MongoMemoryServer;

declare global {
    var signin: (id?: string) => string[];
}

beforeAll(async () => {
    process.env.JWT_KEY = 'asdfgh';

    mongo = await MongoMemoryServer.create();
    const mongoUri = mongo.getUri();

    await mongoose.connect(mongoUri, {});
});

beforeEach(async () => {
    jest.clearAllMocks();
    if (mongoose.connection.db) {
        const collections = await mongoose.connection.db.collections();

        for (let collection of collections) {
            await collection.deleteMany({});
        }
    }
});

afterAll(async () => {
    if (mongo) {
        await mongo.stop();
    }
    await mongoose.connection.close();
});


global.signin = (id?: string) => {
    // Build a JWT payload. { id, email }

    const payload = {
        id: id || new mongoose.Types.ObjectId().toHexString(),
        email: 'test@test.com'
    };

    // Create a JWT

    const token: string = jwt.sign(payload, process.env.JWT_KEY!);

    // Build session Object. { jwt: MY_JWT }

    const session = {jwt: token};

    // Turn that session into JSON

    const sessionJSON = JSON.stringify(session);

    // Take JSON and encode it as base64

    const base64 = Buffer.from(sessionJSON).toString('base64');

    // return a string that's a cookie with encoded data
    return [`session=${base64}`];
};

