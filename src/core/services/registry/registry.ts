import { ConfigRegistry } from "./config.registry";
import { NodeTypeRegistry } from "./node-type.registry";
import { NodeRegistry } from "./node.registry";

export class Registry {
  constructor(
    public readonly config: ConfigRegistry,
    public readonly node: NodeRegistry,
    public readonly nodeType: NodeTypeRegistry
  ) {}
}