import { IS_PUBLIC_KEY } from "@/decorators/public";
import { ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";

import { ApiKeyAuthGuard } from "./api-key-auth.guard";
import { ApiKeyService } from "./api-key.service";

describe("ApiKeyAuthGuard", () => {
  const apiKeyService = {
    validate: jest.fn(),
  } as unknown as ApiKeyService;

  const reflector = {
    getAllAndOverride: jest.fn(),
  } as unknown as Reflector;

  const guard = new ApiKeyAuthGuard(apiKeyService, reflector);

  const context = {
    getHandler: () => ({}),
    getClass: () => ({}),
    switchToHttp: () => ({
      getRequest: () => ({ headers: {} }),
    }),
  } as unknown as ExecutionContext;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("permite rota pública sem header", async () => {
    jest.spyOn(reflector, "getAllAndOverride").mockReturnValue(true);

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(apiKeyService.validate).not.toHaveBeenCalled();
    expect(reflector.getAllAndOverride).toHaveBeenCalledWith(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
  });

  it("exige x-api-key quando a rota não é pública", async () => {
    jest.spyOn(reflector, "getAllAndOverride").mockReturnValue(false);

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
