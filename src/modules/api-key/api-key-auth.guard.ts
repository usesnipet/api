import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";

import { ApiKeyService } from "./api-key.service";

@Injectable()
export class ApiKeyAuthGuard implements CanActivate {
  constructor(private readonly apiKeyService: ApiKeyService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{ headers: Record<string, string | string[] | undefined> }>();
    const header = request.headers["x-api-key"];

    const secret = Array.isArray(header) ? header[0] : header;
    if (!secret) {
      throw new UnauthorizedException("Missing x-api-key header");
    }

    const row = await this.apiKeyService.validate(secret);
    if (!row) {
      throw new UnauthorizedException("Invalid or revoked API key");
    }

    return true;
  }
}
