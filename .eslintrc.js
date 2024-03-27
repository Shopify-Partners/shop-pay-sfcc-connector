/* eslint-disable linebreak-style */
/* eslint-disable strict */
module.exports = {
    root: true,
    extends: "eslint:recommended",
    env: {
        commonjs: true,
        es6: true,
        browser: true,
    },
    globals: {
        dw: true,
        customer: true,
        session: true,
        request: true,
        response: true,
        empty: true,
        PIPELET_ERROR: true,
        PIPELET_NEXT: true,
    },
    rules: {
        "eol-last": ["error", "always"],
        "func-style": "off",
        "global-require": "off",
        "no-bitwise": "off",
        "no-plusplus": "off",
        "no-unneeded-ternary": "off",
        "no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
        "prefer-const": "off",
        "prefer-spread": "off",
        indent: ["error", 4, { SwitchCase: 1 }],
        quotes: "off",
        radix: ["error", "always"],
        semi: ["error", "always"],
    },
    parserOptions: {
        "ecmaVersion": 2018,
        "ecmaFeatures": {
          "jsx": true
        }
    }
};
