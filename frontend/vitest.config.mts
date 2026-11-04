import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  // React 19 automatic JSX runtime (same as tsconfig "jsx": "react-jsx").
  oxc: { jsx: { runtime: "automatic" } },
  resolve: {
    // "@/…" imports, from tsconfig.json paths
    tsconfigPaths: true,
    alias: {
      // `server-only` throws outside a React Server environment; tests import those modules directly.
      "server-only": fileURLToPath(new URL("./src/test/server-only-stub.ts", import.meta.url)),
    },
  },
  test: {
    // Component tests need a DOM; pure logic tests opt into node with `// @vitest-environment node`.
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    restoreMocks: true,
  },
});
