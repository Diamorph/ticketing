import nats from "node-nats-streaming";
import {TicketCreatedPublisher} from "./events/ticket-created-publisher";

const stan = nats.connect("ticketing", "abc", {
    url: "http://localhost:4222"
});

stan.on("connect", async (): Promise<void> => {
    console.log("Publisher connected to nats");

    await new TicketCreatedPublisher(stan).publish({
        id: "123",
        title: "Connor Price",
        price: 200
    });

    // const data: string = JSON.stringify({
    //     id: 123,
    //     title: "MGK",
    //     price: 20
    // });
    //
    // stan.publish("ticket:created", data, () => {
    //     console.log("Event published");
    // });
});