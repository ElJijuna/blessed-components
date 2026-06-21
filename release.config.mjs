export default {
  branches: ['main'],
  plugins: [
    [
      '@semantic-release/commit-analyzer',
      {
        preset: 'conventionalcommits',
      },
    ],
    [
      '@semantic-release/release-notes-generator',
      {
        preset: 'conventionalcommits',
      },
    ],
    '@semantic-release/npm',
    '@semantic-release/github',
    [
      '@semantic-release/exec',
      {
        successCmd:
          'if [ -n "$GITHUB_OUTPUT" ]; then echo "published=true" >> "$GITHUB_OUTPUT"; echo "version=<%= nextRelease.version %>" >> "$GITHUB_OUTPUT"; fi',
      },
    ],
  ],
};
