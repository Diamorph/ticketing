import mongoose from "mongoose";
import {Password} from "../services/password";

// An interface that describes the properties
// that are required to create a new User

interface UserAttrs {
    email: string;
    password: string;
}

// an interface that describes the properties that User Model has

interface UserModel extends mongoose.Model<UserDoc> {
    build(attrs: UserAttrs): UserDoc;
}

// an interface that describes the properties that a User Document has

interface UserDoc extends mongoose.Document {
    email: string;
    password: string;
    // createdAt: string;
    // updatedAt: string;
}

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
}, {
    toJSON: {
        transform(doc, ret) {
            ret.id = ret._id;
            delete ret._id;
            delete ret.password;
            delete ret.__v;
        }
    }
});

userSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        const hashed: string = await Password.toHash(this.get('password'));
        this.set('password', hashed);
    }
    next();
});

userSchema.statics.build = (attrs: UserAttrs) => {
    return new User(attrs);
};

const User = mongoose.model<UserDoc, UserModel>('User', userSchema);

// const buildUser = (attrs: UserAttrs) => {
//     return new User(attrs);
// };

// User.build({
//     email: 'test@test.com',
//     password: '123456',
// });

export {User};