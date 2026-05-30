import { ok } from "../../common/responses/http-response.js";

export class HealthController {
  getHealth = async (): Promise<unknown> => {
    return ok("OK");
  };
}
