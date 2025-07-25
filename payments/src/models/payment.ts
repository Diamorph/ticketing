import mongoose from "mongoose";

interface PaymentAttrs {
    orderId: string;
    stripeId: string;
}

interface PaymentDoc extends mongoose.Document {
    orderId: string;
    stripeId: string;
    version: number;
}

interface PaymentModel extends mongoose.Model<PaymentDoc> {
    build(attrs: PaymentAttrs): PaymentDoc;
}

const paymentSchema = new mongoose.Schema({
    orderId: {
        type: String,
        required: true,
    },
    stripeId: {
        type: String,
        required: true,
    }
}, {
    toJSON: {
        transform(doc: PaymentDoc, ret) {
            ret.id = doc._id;
            delete doc._id;
        }
    }
});

paymentSchema.statics.build = (attrs: PaymentAttrs) => {
    return new Payment(attrs);
}

const Payment = mongoose.model<PaymentDoc, PaymentModel>(
    "Payment",
    paymentSchema,
);

export {Payment, PaymentModel, PaymentDoc};