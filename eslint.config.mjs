import { defineConfig, globalIgnores } from "eslint/config";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";

const eslintConfig = defineConfig([
  ...tseslint.configs.recommended,
  { files: ["**/*.{ts,tsx}"], plugins: { "react-hooks": reactHooks }, rules: reactHooks.configs.recommended.rules },
  globalIgnores(["dist/**", "node_modules/**", ".next/**"]),
]);

export default eslintConfig;
