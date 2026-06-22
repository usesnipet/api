import { BaseService, ReadOpts } from "@/common/crud";
import { DrizzleFilterConverter, FilterOptions } from "@/common/filter";
import { Injectable } from "@nestjs/common";

import { User } from "./model/user.model";

@Injectable()
export class UserService extends BaseService {
  async find(
    filter: FilterOptions<User>,
    opts?: ReadOpts
  ): Promise<User[]> {
    const rows = await this.db(opts).query.user.findMany(
      DrizzleFilterConverter.toFindMany(filter)
    );
    return rows.map((row) => User.fromRow(row));
  }
}
