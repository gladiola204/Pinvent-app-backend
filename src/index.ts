import { app } from "./server";
import mongoose from "mongoose";

const port = process.env.PORT || 8000;

mongodb().catch(err => console.log(err));

async function mongodb(): Promise<void> {
    await mongoose.connect(`${process.env.MONGO_URI}`);
    app.listen(port, () => {
        console.log(`Listening on port ${port}`);
    })
}

