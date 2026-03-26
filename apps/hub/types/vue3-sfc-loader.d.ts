declare module "vue3-sfc-loader/dist/vue3-sfc-loader.esm.js" {
  export function loadModule(
    path: string,
    options: {
      moduleCache: Record<string, unknown>;
      getFile: (path: string) => Promise<string> | string;
      addStyle: (css: string) => void;
      [key: string]: unknown;
    }
  ): Promise<unknown>;
}
