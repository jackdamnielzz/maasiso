import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';

export default [
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'test-deploy/**',
      'html5up-hyperspace/**',
      'my-rooflow-project/**',
      'public/**',
      'scripts/**',
      '*.config.js',
      'server.js',
    ],
  },
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    rules: {
      // Bestaand beleid: deze regels stonden bewust uit; stapsgewijs aanzetten
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      'no-case-declarations': 'off',
      'prefer-const': 'off',
      // Cosmetisch; gangbaar om uit te zetten bij Nederlandse teksten met apostrofs
      'react/no-unescaped-entities': 'off',
      // Nieuwe strenge react-hooks regels (React Compiler-era): bestaande patronen
      // eerst als waarschuwing, zodat lint weer signaal geeft zonder 30 errors
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/immutability': 'warn',
      'react-hooks/purity': 'warn',
      'react-hooks/use-memo': 'warn',
      'react-hooks/refs': 'warn',
    },
  },
];
