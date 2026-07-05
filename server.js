import app from "./app.js";
import db from "./server/db/client.js";

const PORT = process.env.PORT || 2222;
await db.connect();

app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}!`);
});