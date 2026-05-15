import "reflect-metadata";

import { RunnerDef } from "@/core/runtime/runner";
import { NodeManifest } from "@/core/manifest/node";
import { ok } from "neverthrow";

import { RegistryError } from "./errors/registry.error";
import { NodeRegistry } from "./node.registry";

const dummyRunner: RunnerDef = {
  id: "dummy",
  execute: async () => {}
}

describe("NodeRegistry", () => {
  test("registerRunner requires node to exist", () => {
    const registry = new NodeRegistry();
    const res = registry.registerRunner("node-1", dummyRunner);
    expect(res.isErr()).toBe(true);
    expect(res._unsafeUnwrapErr()).toBeInstanceOf(RegistryError);
    expect(res._unsafeUnwrapErr().message).toBe("Node not found for runner: node-1");
  });

  test("registerRunner registers and getRunner returns it", async () => {
    const registry = new NodeRegistry();

    const node: NodeManifest = {
      id: "node-1",
      type: "test",
      metadata: { name: "node-1", description: "test" },
    };
    const regRes = await registry.register(node);
    expect(regRes).toEqual(ok(undefined));

    const runnerRes = registry.registerRunner("node-1", dummyRunner);
    expect(runnerRes.isOk()).toBe(true);

    const getRes = registry.getRunner("node-1");
    expect(getRes.isOk()).toBe(true);
    expect(getRes._unsafeUnwrap()).toBe(dummyRunner);
  });

  test("registerRunner rejects duplicates", async () => {
    const registry = new NodeRegistry();
    await registry.register({
      id: "node-1",
      type: "test",
      metadata: { name: "node-1", description: "test" },
    });

    expect(registry.registerRunner("node-1", dummyRunner).isOk()).toBe(true);
    const dup = registry.registerRunner("node-1", dummyRunner);
    expect(dup.isErr()).toBe(true);
    expect(dup._unsafeUnwrapErr().message).toBe("Runner already registered: node-1");
  });

  test("getRunner returns not found error", () => {
    const registry = new NodeRegistry();
    const res = registry.getRunner("missing");
    expect(res.isErr()).toBe(true);
    expect(res._unsafeUnwrapErr().message).toBe("Runner not found: missing");
  });
});

