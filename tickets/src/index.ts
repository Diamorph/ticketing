import {app} from './app';
import mongoose from "mongoose";
import {natsWrapper} from "./nats-wrapper";
import {OrderCanceledListener} from "./events/listeners/order-canceled-listener";
import {OrderCreatedListener} from "./events/listeners/order-created-listener";

const start = async () => {
    if (!process.env.JWT_KEY) {
        throw new Error('JWT_KEY must be defined');
    }
    if (!process.env.MONGO_URI) {
        throw new Error('MONGO_URI must be defined');
    }
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');
    } catch (error) {
        console.error(error);
    }


    if (!process.env.NATS_CLIENT_ID) {
        throw new Error('NATS_CLIENT_ID must be defined');
    }
    if (!process.env.NATS_URL) {
        throw new Error('NATS_URL must be defined');
    }
    if (!process.env.NATS_CLUSTER_ID) {
        throw new Error('NATS_CLUSTER_ID must be defined');
    }

    try {
        await natsWrapper.connect(process.env.NATS_CLUSTER_ID, process.env.NATS_CLIENT_ID, process.env.NATS_URL);

        natsWrapper.client.on("close", () => {
            console.log("NATS connected closed");
            process.exit();
        });
        process.on("SIGINT", () => natsWrapper.client.close());
        process.on("SIGTERM", () => natsWrapper.client.close());

        new OrderCreatedListener(natsWrapper.client).listen();
        new OrderCanceledListener(natsWrapper.client).listen();

        console.log('NATS Connected');
    } catch (error) {
        console.error(error);
    }

    app.listen(3000, () => {
        console.log("Server started on port 3000");
    });
}

start();


