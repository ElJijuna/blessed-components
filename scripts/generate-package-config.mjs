import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const check = process.argv.includes('--check');
const packagePath = join(root, 'package.json');
const tsupConfigPath = join(root, 'tsup.config.ts');

function readDirNames(dir) {
  return readdirSync(join(root, dir), { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));
}

function readTsFiles(dir) {
  return readdirSync(join(root, dir), { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.ts'))
    .map((entry) => entry.name.slice(0, -'.ts'.length))
    .sort((a, b) => a.localeCompare(b));
}

function sourceExists(path) {
  return existsSync(join(root, path));
}

function distExport(path) {
  return {
    types: `./dist/${path}.d.ts`,
    import: `./dist/${path}.js`,
    require: `./dist/${path}.cjs`,
  };
}

function collectComponentEntries() {
  const entries = [];
  const adapters = new Set(
    readTsFiles('src/adapters/blessed').filter((name) => name !== 'render-box' && name !== 'types'),
  );

  for (const category of readDirNames('src/components')) {
    for (const component of readDirNames(`src/components/${category}`)) {
      const indexSource = `src/components/${category}/${component}/index.ts`;

      if (!sourceExists(indexSource)) {
        continue;
      }

      entries.push({
        exportPath: `./${component}`,
        key: `${component}/index`,
        source: indexSource,
      });

      if (adapters.has(component)) {
        entries.push({
          exportPath: `./${component}/blessed`,
          key: `${component}/blessed`,
          source: `src/adapters/blessed/${component}.ts`,
        });
      }
    }
  }

  return entries.sort((a, b) => a.key.localeCompare(b.key));
}

function collectCoreEntries() {
  return readTsFiles('src/core').map((name) => ({
    exportPath: name === 'index' ? './core' : `./core/${name}`,
    key: `core/${name}`,
    source: `src/core/${name}.ts`,
  }));
}

function collectPrimitiveEntries() {
  const entries = [
    {
      exportPath: './primitives',
      key: 'primitives/index',
      source: 'src/primitives/index.ts',
    },
  ];

  for (const primitive of readDirNames('src/primitives')) {
    const indexSource = `src/primitives/${primitive}/index.ts`;

    if (sourceExists(indexSource)) {
      entries.push({
        exportPath: `./primitives/${primitive}`,
        key: `primitives/${primitive}/index`,
        source: indexSource,
      });
    }
  }

  return entries.sort((a, b) => a.key.localeCompare(b.key));
}

function collectEntries() {
  return [
    {
      exportPath: '.',
      key: 'index',
      source: 'src/index.ts',
    },
    ...collectCoreEntries(),
    ...collectPrimitiveEntries(),
    ...collectComponentEntries(),
  ];
}

function generateExports(entries) {
  return Object.fromEntries(
    entries.map((entry) => {
      const distPath = entry.key.endsWith('/index') ? entry.key : entry.key;

      return [entry.exportPath, distExport(distPath)];
    }),
  );
}

function generateTsupConfig(entries) {
  const entryObject = Object.fromEntries(entries.map((entry) => [entry.key, entry.source]));
  const serializedEntries = JSON.stringify(entryObject, null, 2)
    .replaceAll('"', "'")
    .replace(/'([^']+)':/g, (_, key) => (/^[A-Za-z_$][\w$]*$/.test(key) ? `${key}:` : `'${key}':`))
    .replace(/\n\}$/u, ',\n}');

  return `import { defineConfig, type Options } from 'tsup';

const entry = ${serializedEntries};
const entryChunks = Array.from(
  { length: Math.ceil(Object.entries(entry).length / 35) },
  (_, index) => Object.fromEntries(Object.entries(entry).slice(index * 35, (index + 1) * 35)),
);
const sharedConfig: Omit<Options, 'clean' | 'entry'> = {
  dts: true,
  format: ['esm', 'cjs'],
  outExtension({ format }) {
    return {
      js: format === 'cjs' ? '.cjs' : '.js',
    };
  },
  platform: 'node',
  sourcemap: true,
  splitting: false,
  target: 'node22',
  treeshake: true,
} as const;

export default entryChunks.map((chunk, index) =>
  defineConfig({
    ...sharedConfig,
    clean: index === 0,
    entry: chunk,
  }),
);
`;
}

function assertCurrent(path, expected) {
  const current = readFileSync(path, 'utf8');

  if (current !== expected) {
    throw new Error(`${relative(root, path)} is stale. Run \`npm run package:generate\`.`);
  }
}

const entries = collectEntries();
const packageJson = JSON.parse(readFileSync(packagePath, 'utf8'));
const nextPackageJson = {
  ...packageJson,
  exports: generateExports(entries),
};
const nextPackageSource = `${JSON.stringify(nextPackageJson, null, 2)}\n`;
const nextTsupConfig = generateTsupConfig(entries);

if (check) {
  assertCurrent(packagePath, nextPackageSource);
  assertCurrent(tsupConfigPath, nextTsupConfig);
} else {
  writeFileSync(packagePath, nextPackageSource);
  writeFileSync(tsupConfigPath, nextTsupConfig);
}

console.log(`Package config ${check ? 'checked' : 'generated'}: ${entries.length} entries.`);
