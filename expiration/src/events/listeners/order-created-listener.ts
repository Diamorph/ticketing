import {Listener, OrderCreatedEvent, Subjects} from "@diamorph_tickets/common";
import {Message} from "node-nats-streaming";
import {expirationQueue} from "../../queues/expiration-queue";

export class OrderCreatedListener extends Listener<OrderCreatedEvent>{
    readonly subject: Subjects.OrderCreated = Subjects.OrderCreated;
    readonly queueGroupName: string = "expiration-service";

    async onMessage(data: OrderCreatedEvent["data"], msg: Message): Promise<void> {
        const delay: number = new Date(data.expiresAt).getTime() - new Date().getTime();

        console.log("Waiting this mane ms to process the job: ", delay);

        await expirationQueue.add({
            orderId: data.id
        },
            {delay}
        );

        msg.ack();
    }
}