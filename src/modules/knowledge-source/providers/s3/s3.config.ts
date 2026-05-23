export interface S3SourceConfig extends Record<string, unknown> {
  bucket: string;
  region: string;
  endpoint?: string;
  prefix?: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  forcePathStyle?: boolean;
}
