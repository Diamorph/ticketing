import express, {NextFunction, Request, Response, Router} from "express";
import {body} from 'express-validator';
import {User} from "../models/user";
import {validateRequest, BadRequestError} from "@diamorph_tickets/common";
import {Password} from "../services/password";
import jwt from "jsonwebtoken";

const router: Router = express.Router();

router.post("/api/users/signin",
    [
        body("email").isEmail().withMessage("Email must be valid"),
        body("password").trim().notEmpty().withMessage("Password is required"),
    ],
    validateRequest,
    async (req: Request, res: Response, next: NextFunction) => {
        const {email, password} = req.body;

        const existingUser = await User.findOne({email});
        if (!existingUser) {
            throw new BadRequestError("Invalid Credentials");
        }

        const passwordsMatch = await Password.compare(
            existingUser.password,
            password
        );

        if (!passwordsMatch) {
            throw new BadRequestError("Invalid Credentials");
        }

        // Generate JWT
        const userJwt: string = jwt.sign({
            id: existingUser.id,
            email: existingUser.email
        }, process.env.JWT_KEY!);

        // Store it on session object

        req.session = {
            jwt: userJwt
        };

        res.status(200).send(existingUser);
    }
);

export {router as signinRouter};