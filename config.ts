import { DataSource } from "typeorm";
import Tables from "./entities";
import dotenv from "dotenv";

dotenv.config();
const AppDataSource = new DataSource({
  type: "postgres",
  host: "localhost",
  port: 5432,
  username: process.env.POSTGRES_USERNAME,
  password: process.env.POSTGRES_PASSWORD,
  database: "cwl",
  synchronize: true,
  logging: true,
  entities: Tables,
});
AppDataSource.initialize()
  .then(async () => {
    console.log("Connected to database");
  })
  .catch((error) => console.log(error));

export default AppDataSource;
