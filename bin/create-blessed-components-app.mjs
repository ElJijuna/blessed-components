#!/usr/bin/env node
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { basename, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const templateRoot = join(root, 'templates/starter');
const args = process.argv.slice(2);

if (args[0] === 'create') {
  args.shift();
}

function help() {
  return `blessed-components create <directory>
create-blessed-components-app <directory>

Options:
  --dry-run   Print files that would be created
  --force     Allow writing into an existing directory
  --help      Show this help
`;
}

function listTemplateFiles(dir = templateRoot, prefix = '') {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const source = join(dir, entry.name);
    const target = join(prefix, entry.name);

    return entry.isDirectory() ? listTemplateFiles(source, target) : [target];
  });
}

function copyTemplateFile(source, target, replacements) {
  const raw = readFileSync(source, 'utf8');
  const content = Object.entries(replacements).reduce(
    (next, [key, value]) => next.replaceAll(`{{${key}}}`, value),
    raw,
  );

  mkdirSync(resolve(target, '..'), { recursive: true });
  writeFileSync(target, content);
}

function validPackageName(name) {
  return name
    .toLowerCase()
    .replaceAll(/[^a-z0-9-]+/g, '-')
    .replaceAll(/^-|-$/g, '');
}

if (args.includes('--help') || args.includes('-h')) {
  console.log(help());
  process.exit(0);
}

const dryRun = args.includes('--dry-run');
const force = args.includes('--force');
const targetArg = args.find((arg) => !arg.startsWith('-')) ?? 'blessed-components-app';
const targetDir = resolve(process.cwd(), targetArg);
const appName = validPackageName(basename(targetDir)) || 'blessed-components-app';
const files = listTemplateFiles();

if (existsSync(targetDir) && !force && readdirSync(targetDir).length > 0) {
  console.error(`Target directory is not empty: ${targetDir}`);
  process.exit(1);
}

if (dryRun) {
  console.log(`Would create ${appName} in ${targetDir}`);

  for (const file of files) {
    console.log(file);
  }

  process.exit(0);
}

mkdirSync(targetDir, { recursive: true });

for (const file of files) {
  const source = join(templateRoot, file);
  const target = join(targetDir, file);

  if (statSync(source).isFile()) {
    copyTemplateFile(source, target, { appName });
  }
}

console.log(`Created ${appName} in ${targetDir}`);
console.log('Next: npm install && npm run dev');
