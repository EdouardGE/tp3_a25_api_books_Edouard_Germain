import { connect as mongooseConnect } from "mongoose";
import dotenvFlow from "dotenv-flow";
import app from "./app.mjs";

dotenvFlow.config();

const port = process.env.PORT ?? 3000;
const mongoUri =
  process.env.MONGODB_URI ??
  process.env.MONGO_URI ?? // au cas où
  "mongodb://localhost:27017/etcaetera";

mongooseConnect(mongoUri)
  .then(() => {
    console.log("Connexion à MongoDB réussie");
    app.listen(port, () => console.log(`Serveur démarré sur le port ${port}`));
  })
  .catch((err) => {
    console.error("Erreur de connexion à MongoDB:", err);
    process.exit(1);
  });
