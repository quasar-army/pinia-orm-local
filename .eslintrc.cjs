module.exports = {
  root: true,

  parserOptions: {
    parser: require.resolve('@typescript-eslint/parser'),
    extraFileExtensions: ['.vue'],
    ecmaVersion: '2022',
  },

  env: {
    browser: true,
    es2022: true,
    node: true,
    'vue/setup-compiler-macros': true,
  },

  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:vue/vue3-recommended',
    'standard',
  ],

  plugins: [
    // required to apply rules which need type information
    '@typescript-eslint',

    // https://eslint.vuejs.org/user-guide/#why-doesn-t-it-work-on-vue-files
    // required to lint *.vue files
    'vue',

  ],

  globals: {
    process: 'readonly',
    defineModel: 'readonly',
  },

  // add your custom rules here
  rules: {

    // allow async-await
    'generator-star-spacing': 'off',
    // allow paren-less arrow functions
    'arrow-parens': 'off',
    'one-var': 'off',
    'no-void': 'off',
    'multiline-ternary': 'off',
    'vue/no-v-text-v-html-on-component': 'off',

    'import/first': 'off',
    'import/namespace': 'error',
    'import/default': 'error',
    'import/export': 'error',
    'import/extensions': 'off',
    'import/no-unresolved': 'off',
    'import/no-extraneous-dependencies': 'off',

    // to prevent false positives in diffs
    'comma-dangle': ['error', 'always-multiline'],
    // enforcing code style in the vue docs
    'vue/component-tags-order': ['warn', {
      order: ['script', 'template', 'style'],
    }],
    // to prevent issues with typescript linting
    'func-call-spacing': 'off',

    // The core 'import/named' rules
    // does not work with type definitions
    'import/named': 'off',

    'prefer-promise-reject-errors': 'off',

    quotes: ['warn', 'single', { avoidEscape: true }],

    'no-redeclare': 'off',
    '@typescript-eslint/no-redeclare': 'off',
    'no-empty-function': 'off',
    '@typescript-eslint/no-empty-function': ['error', {
      allow: ['decoratedFunctions'],
    }],

    // The core 'no-unused-vars' rules (in the eslint:recommended ruleset)
    // does not work with type definitions
    'no-unused-vars': 'off',

    // allow debugger during development only
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
  },
}
