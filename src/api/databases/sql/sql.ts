import { Sequelize } from "sequelize";

// setup sequelize with provided parameters
const sequelize = new Sequelize({
  dialect: "mysql",
  host: "mysql",
  port: parseInt(process.env.MYSQL_PORT as string, 10) || 3306,
  username: process.env.MYSQL_USER || "",
  password: process.env.MYSQL_PASSWORD || "",
  database: process.env.MYSQL_DATABASE || "",
});

// initialize databases
const initializeDatabase = async () => {
  try {
    // connect to the database
    await sequelize.authenticate();
    console.info(
      "Connection to the database has been established successfully.",
    );

    // a primary instance is assigned to alter tables if necessary in development/playground
    // not ideal, but works and good enough for now
    if (process.env.NODE_ENV !== "production" && process.env.IS_PRIMARY) {
      await sequelize.sync({ alter: true });
    } else {
      await sequelize.sync();
    }

    console.info("All models were synchronized successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
};

export { initializeDatabase, sequelize };
