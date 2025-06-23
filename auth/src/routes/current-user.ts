import express, {Request, Response, Router, NextFunction} from "express";
import {currentUser} from "@diamorph_tickets/common";

const router: Router = express.Router();

router.get("/api/users/currentUser", currentUser, async (req: Request, res: Response, next: NextFunction) => {
    res.send(
        {currentUser: req.currentUser || null}
    );
});

export {router as currentUserRouter};