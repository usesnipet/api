import { BaseService, ReadOpts } from "@/common/crud";
import { DrizzleFilterConverter, FilterOptions } from "@/common/filter";
import { user } from "@/db";
import { Injectable } from "@nestjs/common";
import { count } from "drizzle-orm";

import { CreateUserDto } from "./dto/create-user.dto";
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

  async count(opts?: ReadOpts): Promise<number> {
    const [row] = await this.db(opts).select({ count: count() }).from(user);
    return row?.count ?? 0;
  }

  async create(dto: CreateUserDto): Promise<User> {
    const row = await this.db().insert(user).values({
      name: dto.name,
      email: dto.email,
      password: dto.password,
    }).returning();
    return User.fromRow(row[0]);
  }
}
