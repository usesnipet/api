import "reflect-metadata";

import { Type } from "class-transformer";
import { IsString, IsUUID, ValidateNested } from "class-validator";

import { HttpFilterConverter } from "./http-filter.converter";

class Tag {
  @IsUUID()
  id!: string;

  static fromRow() {
    return new Tag();
  }
}

class Flow {
  @IsUUID()
  id!: string;

  @IsString()
  name!: string;

  @IsString()
  secret!: string;

  @ValidateNested()
  @Type(() => Tag)
  tag?: Tag;

  static fromRow() {
    return new Flow();
  }
}

describe("HttpFilterConverter", () => {
  it("without config.select returns only requested fields validated against entity", () => {
    const filter = HttpFilterConverter.fromQuery(
      Flow,
      { select: ["id", "unknown"] },
      {},
    );

    expect(filter.select).toEqual(["id"]);
  });

  it("uses config.select as default projection when query omits select", () => {
    const filter = HttpFilterConverter.fromQuery(Flow, {}, {
      select: ["id", "name"],
    });

    expect(filter.select).toEqual(["id", "name"]);
    expect(filter.select).not.toContain("secret");
  });

  it("narrows config.select when query provides select", () => {
    const filter = HttpFilterConverter.fromQuery(
      Flow,
      { select: ["id", "secret"] },
      { select: ["id", "name"] },
    );

    expect(filter.select).toEqual(["id"]);
  });

  it("blocks relations unless configured; query only picks from config", () => {
    const withoutConfig = HttpFilterConverter.fromQuery(
      Flow,
      { relations: ["tag"] },
      {},
    );
    expect(withoutConfig.relations).toBeUndefined();

    const withoutQuery = HttpFilterConverter.fromQuery(Flow, {}, {
      relations: ["tag"],
    });
    expect(withoutQuery.relations).toBeUndefined();

    const withQuery = HttpFilterConverter.fromQuery(
      Flow,
      { relations: ["tag", "missing"] },
      { relations: ["tag"] },
    );
    expect(withQuery.relations).toEqual(["tag"]);
  });

  it("restricts order to entity columns", () => {
    const filter = HttpFilterConverter.fromQuery(
      Flow,
      { order: "name,bad:desc" },
      {},
    );

    expect(filter.order).toEqual([{ field: "name", direction: undefined }]);
  });
});
