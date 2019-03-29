declare module "glslify" {
  export function compile(
    source: string,
    options: { basedir?: string }
  ): string;
}
