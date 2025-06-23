import express, {Request, Response, Router, NextFunction} from "express";
import {currentUser, requireAuth} from "@diamorph_tickets/common";

const router: Router = express.Router();

router.get("/api/users/currentUser", currentUser, requireAuth, async (req: Request, res: Response, next: NextFunction) => {
    res.send(
        {currentUser: req.currentUser || null}
    );
});

export {router as currentUserRouter};