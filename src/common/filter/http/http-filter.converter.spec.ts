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

  it("parses where bracket notation and applies config.where allow list", () => {
    const filter = HttpFilterConverter.fromQuery(
      Flow,
      {
        "where[name][eq]": "mayron",
        "where[secret][eq]": "hidden",
      },
      { where: ["name"] },
    );

    expect(filter.where).toEqual({
      name: { op: "eq", value: "mayron" },
    });
  });

  it("parses where shorthand and in operator from nested query.where", () => {
    const filter = HttpFilterConverter.fromQuery(
      Flow,
      {
        where: {
          name: "mayron",
          id: { in: ["uuid-1", "uuid-2"] },
        },
      },
      {},
    );

    expect(filter.where).toEqual({
      name: "mayron",
      id: { op: "in", value: ["uuid-1", "uuid-2"] },
    });
  });

  it("parses order bracket notation and applies allow list", () => {
    const filter = HttpFilterConverter.fromQuery(
      Flow,
      {
        "order[name]": "asc",
        "order[secret]": "desc",
        "order[bad]": "asc",
      },
      { order: ["name", "secret"] },
    );

    expect(filter.order).toEqual([
      { field: "name", direction: "asc" },
      { field: "secret", direction: "desc" },
    ]);
  });
});
