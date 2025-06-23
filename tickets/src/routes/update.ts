import express, {Request, Response} from "express";
import {Ticket} from "../models/ticket";
import {
    BadRequestError,
    NotAuthorizedError,
    NotFoundError,
    requireAuth,
    validateRequest
} from "@diamorph_tickets/common";
import {body} from "express-validator";
import {natsWrapper} from "../nats-wrapper";
import {TicketUpdatedPublisher} from "../events/publisher/ticket-updated-publisher";

const router = express.Router();

router.put("/api/tickets/:id",
    requireAuth,
    [
        body('title').not().isEmpty().withMessage('Title is required'),
        body('price').isFloat({gt: 0}).withMessage('Price must be greater than zero')
    ],
    validateRequest,
    async (req: Request, res: Response): Promise<void> => {

    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
        throw new NotFoundError();
    }

    if (ticket.userId !== req.currentUser!.id) {
        throw new NotAuthorizedError();
    }

    if (ticket.orderId) {
        throw new BadRequestError("Cannot edit reserved ticket");
    }

    const {title, price} = req.body;

    ticket.set({title, price});
    await ticket.save();

    await new TicketUpdatedPublisher(natsWrapper.client).publish({
        id: ticket.id,
        title: ticket.title,
        price: ticket.price,
        userId: ticket.userId,
        version: ticket.version
    });

    res.status(200).send(ticket);

});

export {router as updateTicketRouter};