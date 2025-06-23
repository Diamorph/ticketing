import express, {NextFunction, Request, Response} from "express";
import {NotAuthorizedError, NotFoundError, requireAuth} from "@diamorph_tickets/common";
import {Order, OrderStatus} from "../models/order";
import {OrderCanceledPublisher} from "../events/publishers/order-canceled-publisher";
import {natsWrapper} from "../nats-wrapper";

const router = express.Router();

router.delete("/api/orders/:orderId",
    requireAuth,
    async (req: Request, res: Response, next: NextFunction) => {
        const order = await Order.findById(req.params.orderId).populate("ticket");
        if (!order) {
            throw new NotFoundError();
        }
        if (order.userId !== req.currentUser!.id) {
            throw new NotAuthorizedError();
        }

        order.status = OrderStatus.Canceled;
        await order.save();

        // publish an event saying this was canceled!
        await new OrderCanceledPublisher(natsWrapper.client).publish({
            id: order.id,
            ticket: {
                id: order.ticket.id
            },
            version: order.version,
        })

        res.status(204).send();
});

export { router as deleteOrderRouter };