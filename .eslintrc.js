module.exports = {
    env: {
        browser: true,
        es6: true,
    },
    extends: ['eslint:recommended', '@pixi/eslint-config', 'prettier'],
    parser: '@typescript-eslint/parser',
    plugins: ['prettier'],
    settings: {},

    rules: {
        'linebreak-style': 0,
        'no-shadow': 'error',
        'sort-imports': 'error',
        'no-console': 'error',
        'prettier/prettier': 'error',
    },
    overrides: [
        {
            files: ['*.ts', '*.tsx'],
            parserOptions: {
                project: ['./tsconfig.json', './examples/tsconfig.json'],
            },
            extends: [
                'plugin:@typescript-eslint/recommended',
                'plugin:@typescript-eslint/recommended-requiring-type-checking',
                'prettier',
            ],
            rules: {
                'no-shadow': 'off',
                '@typescript-eslint/ban-ts-comment': ['error', { 'ts-ignore': 'allow-with-description' }],
                '@typescript-eslint/no-shadow': 'error',
                '@typescript-eslint/explicit-module-boundary-types': 'off',
                '@typescript-eslint/no-use-before-define': 'off',
                '@typescript-eslint/no-unused-vars': 'off',
                'comma-dangle': [
                    'error',
                    {
                        arrays: 'always-multiline',
                        objects: 'always-multiline',
                        imports: 'always-multiline',
                        exports: 'always-multiline',
                        functions: 'never',
                    },
                ],
                // note you must disable the base rule as it can report incorrect errors
                'init-declarations': 'off',
                '@typescript-eslint/init-declarations': ['error', 'always'],
            },
        },
    ],
};
