import winston from "winston";

const isProd = process.env.NODE_ENV === "production";

const transports = [
  new winston.transports.Console({
    level: "info",
    format: winston.format.simple()
  })
];

if (!isProd) {
  transports.push(
    new winston.transports.File({
      filename: "logs/app.log",
      level: "info"
    })
  );
}

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports
});

export default logger;
