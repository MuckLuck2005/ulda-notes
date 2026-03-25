import js from "@eslint/js";
import { jsdoc } from "eslint-plugin-jsdoc";

export default [
    {
        ignores: [
            "node_modules/**",
            ".husky/**",
            "dist/**",
            "coverage/**",
            "generated-docs/**"
        ]
    },
    js.configs.recommended,
    jsdoc({
        config: "flat/recommended",
        files: ["js/**/*.js"],
        rules: {
    "jsdoc/require-jsdoc": [
        "error",
        {
            publicOnly: false,
            require: {
                FunctionDeclaration: true,
                MethodDefinition: true
            }
        }
    ],
    "jsdoc/require-param": "error",
    "jsdoc/require-returns": "error",
    "jsdoc/no-undefined-types": "off"
}
    }),
    {
        files: ["js/**/*.js"],
        languageOptions: {
            ecmaVersion: 2023,
            sourceType: "script",
            globals: {
                window: "readonly",
                document: "readonly"
            }
        },
        rules: {
            "no-var": "error",
            "prefer-const": "error",
            "no-console": "warn",
            eqeqeq: ["error", "always"],
            curly: ["error", "all"]
        }
    }
];