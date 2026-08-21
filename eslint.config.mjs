import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const eslintConfig = [...nextCoreWebVitals, ...nextTypescript, {
  rules: {
    // Keep only intentional relaxations — all safety rules re-enabled
    "react/no-unescaped-entities": "off",
    "@next/next/no-img-element": "off",
  },
}, {
   ignores: ["node_modules/**", ".next/**", "out/**", "build/**", "next-env.d.ts", "examples/**", "skills", ".claude/**"]
}];

export default eslintConfig;
