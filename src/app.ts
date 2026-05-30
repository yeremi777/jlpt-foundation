import Fastify, { FastifyInstance } from "fastify";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import { LOG_LEVEL, NODE_ENV } from "./common/constant.js";
import { AppError } from "./common/errors/app-error.js";
import { clientError, serverError } from "./common/responses/http-response.js";
import { swaggerOptions } from "./common/openapi.js";
import { apiRoutes } from "./routes.js";

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({
    logger:
      NODE_ENV === "test"
        ? false
        : {
            level: LOG_LEVEL,
          },
  });

  app.setErrorHandler((error, _request, reply) => {
    if (error instanceof AppError) {
      if (error.statusCode >= 500) {
        return reply.status(error.statusCode).send(serverError(error.message));
      }

      return reply.status(error.statusCode).send(clientError(error.message));
    }

    app.log.error(error);
    return reply.status(500).send(serverError());
  });

  await app.register(swagger, swaggerOptions);
  await app.register(swaggerUi, {
    routePrefix: "/api-docs",
    uiConfig: {
      docExpansion: "list",
      deepLinking: true,
    },
    staticCSP: true,
  });

  await app.register(apiRoutes, { prefix: "/api/v1" });

  return app;
}
