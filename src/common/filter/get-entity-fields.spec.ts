import "reflect-metadata";

import { Type } from "class-transformer";
import { IsArray, IsString, IsUUID, ValidateNested } from "class-validator";

import { getEntityFields } from "./get-entity-fields";

class Tag {
  @IsUUID()
  id!: string;

  @IsString()
  name!: string;

  static fromRow() {
    return new Tag();
  }
}

class PackageTag {
  @IsUUID()
  packageId!: string;

  @ValidateNested()
  @Type(() => Tag)
  tag?: Tag;

  static fromRow() {
    return new PackageTag();
  }
}

class FieldManifest {
  @IsString()
  name!: string;
}

class Package {
  @IsUUID()
  id!: string;

  @IsString()
  name!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PackageTag)
  packageTags!: PackageTag[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FieldManifest)
  fieldManifest!: FieldManifest[];

  static fromRow() {
    return new Package();
  }
}

describe("getEntityFields", () => {
  it("returns root columns and nested relation paths", () => {
    const fields = getEntityFields(Package);

    expect(fields.columns).toEqual(
      expect.arrayContaining(["id", "name", "fieldManifest"]),
    );
    expect(fields.columns).not.toContain("packageTags");

    expect(fields.relations).toEqual(
      expect.arrayContaining(["packageTags", "packageTags.tag"]),
    );
  });
});
