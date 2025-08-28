import swaggerJsdoc from "swagger-jsdoc";
import { schemas } from "./swagger/schemas";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Mood Journal API",
      version: "1.0.0",
      description: "AI 기반 감정 일기장 API",
    },
    servers: [
      {
        url: "http://localhost:5000",
        description: "Development server",
      },
      {
        url: "https://your-production-domain.com",
        description: "Production server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas,
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./src/routes/*.ts", "./src/**/*.ts"], // 라우트 파일들에서 Swagger 주석을 찾음
};

export const specs = swaggerJsdoc(options);
export const swaggerUi = require("swagger-ui-express");
