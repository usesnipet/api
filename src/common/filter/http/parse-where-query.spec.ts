import {
  extractWhereFromQuery,
  normalizeFieldCondition,
  parseWhereQuery,
} from "./parse-where-query";

describe("parseWhereQuery", () => {
  it("parses bracket notation with explicit op", () => {
    expect(parseWhereQuery({ name: { eq: "mayron" } })).toEqual({
      name: { op: "eq", value: "mayron" },
    });
  });

  it("parses shorthand primitive as eq", () => {
    expect(parseWhereQuery({ name: "mayron", active: "true" })).toEqual({
      name: "mayron",
      active: true,
    });
  });

  it("parses repeated in values as array", () => {
    expect(parseWhereQuery({ name: { in: ["mayron", "duda"] } })).toEqual({
      name: { op: "in", value: ["mayron", "duda"] },
    });
  });

  it("parses in from comma-separated string", () => {
    expect(parseWhereQuery({ id: { in: "a,b,c" } })).toEqual({
      id: { op: "in", value: ["a", "b", "c"] },
    });
  });

  it("parses legacy JSON op object", () => {
    expect(
      parseWhereQuery({
        name: { op: "contains", value: "ron" },
      }),
    ).toEqual({
      name: { op: "contains", value: "ron" },
    });
  });

  it("parses JSON string where param", () => {
    expect(parseWhereQuery('{"name":{"eq":"mayron"}}')).toEqual({
      name: { op: "eq", value: "mayron" },
    });
  });

  it("coerces numeric strings", () => {
    expect(parseWhereQuery({ limit: { gte: "10" } })).toEqual({
      limit: { op: "gte", value: 10 },
    });
  });
});

describe("extractWhereFromQuery", () => {
  it("reads nested query.where (extended parser)", () => {
    expect(
      extractWhereFromQuery({
        where: { name: { eq: "mayron" } },
        select: "id",
      }),
    ).toEqual({
      name: { op: "eq", value: "mayron" },
    });
  });

  it("reads flat where[field][op] keys (simple parser)", () => {
    expect(
      extractWhereFromQuery({
        "where[name][eq]": "mayron",
        "where[active]": "true",
        select: "id",
      }),
    ).toEqual({
      name: { op: "eq", value: "mayron" },
      active: true,
    });
  });

  it("reads repeated flat where[field][in] keys", () => {
    expect(
      extractWhereFromQuery({
        "where[id][in]": ["a", "b"],
      }),
    ).toEqual({
      id: { op: "in", value: ["a", "b"] },
    });
  });
});

describe("normalizeFieldCondition", () => {
  it("returns undefined for empty op object", () => {
    expect(normalizeFieldCondition({})).toBeUndefined();
  });
});
