import {Message, Stan, Subscription, SubscriptionOptions} from "node-nats-streaming";
import {Subjects} from "./subjects";

interface Event {
    subject: Subjects;
    data: any;
}

abstract class Listener<T extends Event> {
    abstract subject: T['subject'];
    abstract queueGroupName: string;
    abstract onMessage(data: T['data'], msg: Message): void;
    private client: Stan;
    protected ackWait = 5 * 1000;

    constructor(client: Stan) {
        this.client = client;
    }

    subscriptionOptions(): SubscriptionOptions {
        return this.client
            .subscriptionOptions()
            .setDeliverAllAvailable()
            .setManualAckMode(true)
            .setAckWait(this.ackWait)
            .setDurableName(this.queueGroupName);
    }

    listen(): void {
        const subscription: Subscription = this.client.subscribe(
            this.subject,
            this.queueGroupName,
            this.subscriptionOptions()
        );

        subscription.on("message", (msg: Message) => {
            console.log(
                `Message received: ${this.subject} / ${this.queueGroupName}`
            );

            const parsedMsg: any = this.parseMessage(msg)
            this.onMessage(parsedMsg, msg);
        });
    }

    parseMessage(msg: Message): any {
        const data = msg.getData();
        return typeof data === "string" ?
            JSON.parse(data) :
            JSON.parse(data.toString("utf8"))
    }
}

export {Listener};