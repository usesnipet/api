import {
  extractOrderFromQuery,
  parseOrderQuery,
} from "./parse-order-query";

describe("parseOrderQuery", () => {
  it("parses bracket object shorthand", () => {
    expect(parseOrderQuery({ name: "asc", createdAt: "desc" })).toEqual([
      { field: "name", direction: "asc" },
      { field: "createdAt", direction: "desc" },
    ]);
  });

  it("parses explicit direction key", () => {
    expect(parseOrderQuery({ name: { direction: "desc" } })).toEqual([
      { field: "name", direction: "desc" },
    ]);
  });

  it("ignores comma string legacy format", () => {
    expect(parseOrderQuery("name:asc,createdAt:desc")).toBeUndefined();
  });

  it("ignores JSON array legacy format", () => {
    expect(
      parseOrderQuery([{ field: "name", direction: "asc" }]),
    ).toBeUndefined();
  });
});

describe("extractOrderFromQuery", () => {
  it("reads nested query.order", () => {
    expect(
      extractOrderFromQuery({
        order: { name: "asc" },
        select: "id",
      }),
    ).toEqual([{ field: "name", direction: "asc" }]);
  });

  it("reads flat order[field] keys", () => {
    expect(
      extractOrderFromQuery({
        "order[name][direction]": "desc",
        "order[createdAt]": "asc",
      }),
    ).toEqual([
      { field: "name", direction: "desc" },
      { field: "createdAt", direction: "asc" },
    ]);
  });
});
