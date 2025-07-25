import express, {NextFunction, Request, Response} from "express";
import {Order} from "../models/order";
import {NotAuthorizedError, NotFoundError, requireAuth} from "@diamorph_tickets/common";

const router = express.Router();

router.get(
    "/api/orders/:orderId",
    requireAuth,
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const order = await Order.findById(req.params.orderId).populate("ticket");
        if (!order) {
            throw new NotFoundError();
        }
        if (order.userId !== req.currentUser!.id) {
            throw new NotAuthorizedError();
        }

        res.status(200).send(order);
});

export { router as showOrderRouter };