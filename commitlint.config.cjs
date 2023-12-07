module.exports = {
  extends: [
    '@commitlint/config-conventional', // scoped packages are not prefixed
  ],
  rules: {
    'header-max-length': [2, 'always', 120],
    'type-enum': [
      2,
      'always',
      [
        'breaking',
        'tweak',
        'feat',
        'fix',
        'changelog',
        'docs',
        'style',
        'refactor',
        'perf',
        'test',
        'build',
        'ci',
        'chore',
        'revert',
        'config',
        'no-release',
        'wip',
        'draft',
        'release',
        'add',
        'change',
        'deprecate',
        'remove',
      ],
    ],
  },
}
