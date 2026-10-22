import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import { dirname, extname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { parse } from 'espree';

const root = fileURLToPath(new URL('..', import.meta.url));
const ignored = new Set([
  '.git',
  'node_modules',
  '.venv',
  '.tmp',
  '.local',
  'dist',
  '__pycache__',
  '.pytest_cache',
  '.ruff_cache',
]);

async function sourceFiles(directory) {
  const found = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (ignored.has(entry.name) || entry.name.endsWith('.egg-info')) continue;
    const path = join(directory, entry.name);
    if (entry.isDirectory()) found.push(...(await sourceFiles(path)));
    else found.push(path);
  }
  return found;
}

function layer(path) {
  return path.match(
    /\/(domain|application|infrastructure|interfaces|presentation|main)\//,
  )?.[1];
}

test('JavaScript dependencies point inward and have no cycles', async () => {
  const graph = new Map();
  const paths = (await sourceFiles(root)).filter((path) => {
    const name = relative(root, path).replaceAll('\\', '/');
    return /^(?:(?:backend|frontend)\/src|packages\/[^/]+\/src)\/.*\.(js|jsx)$/.test(
      name,
    );
  });
  for (const path of paths) {
    const name = relative(root, path).replaceAll('\\', '/');
    const tree = parse(await readFile(path, 'utf8'), {
      ecmaVersion: 'latest',
      sourceType: 'module',
      ecmaFeatures: { jsx: true },
    });
    const imports = [];
    function collect(node) {
      if (!node || typeof node !== 'object') return;
      if (['ImportDeclaration', 'ImportExpression'].includes(node.type)) {
        assert.equal(
          typeof node.source.value,
          'string',
          `Importação não literal em ${name}`,
        );
        imports.push(node.source.value);
      }
      for (const value of Object.values(node)) {
        if (Array.isArray(value)) value.forEach(collect);
        else if (value && typeof value === 'object') collect(value);
      }
    }
    collect(tree);
    const edges = [];
    for (const specifier of imports) {
      const target = specifier.startsWith('.')
        ? resolve(dirname(path), specifier)
        : specifier.startsWith('@flamengo-analytics/domain/')
          ? join(root, 'packages/domain/src', specifier.split('/').at(-1) + '.js')
          : null;
      const targetName = target && relative(root, target).replaceAll('\\', '/');
      const from = layer('/' + name);
      const to = targetName && layer('/' + targetName);
      if (from === 'domain') {
        assert.ok(
          target && (to === 'domain' || targetName.startsWith('contracts/')),
          `${name} -> ${specifier}`,
        );
      }
      if (from === 'application') {
        assert.ok(
          target && ['domain', 'application'].includes(to),
          `${name} -> ${specifier}`,
        );
      }
      if (['infrastructure', 'interfaces', 'presentation'].includes(from)) {
        assert.notEqual(to, 'main', `${name} -> ${specifier}`);
        assert.ok(
          !to || to === from || ['domain', 'application'].includes(to),
          `${name} -> ${specifier}`,
        );
      }
      if (target && ['.js', '.jsx'].includes(extname(target))) edges.push(target);
    }
    graph.set(path, edges);
  }
  assert.ok(paths.length > 10);
  const visiting = new Set();
  const visited = new Set();
  function visit(path) {
    assert.ok(!visiting.has(path), `Ciclo em ${path}`);
    if (visited.has(path)) return;
    visiting.add(path);
    for (const target of graph.get(path) ?? []) visit(target);
    visiting.delete(path);
    visited.add(path);
  }
  for (const path of graph.keys()) visit(path);
});

test('new code and configuration contain no comments', async () => {
  for (const path of await sourceFiles(root)) {
    const text = await readFile(path, 'utf8');
    const extension = extname(path);
    if (['.js', '.jsx', '.mjs'].includes(extension)) {
      const tree = parse(text, {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
        comment: true,
      });
      assert.equal(tree.comments.length, 0, path);
    }
    if (extension === '.css') assert.ok(!text.includes('/*'), path);
    if (extension === '.sql') assert.ok(!/--|\/\*/.test(text), path);
    if (['.yml', '.yaml', '.toml'].includes(extension))
      assert.ok(!/^\s*#/m.test(text), path);
    if (extension === '.html') assert.ok(!text.includes('<!--'), path);
    if (['.svg', '.m', '.dax'].includes(extension))
      assert.ok(
        !text.includes('<!--') && !text.includes('/*') && !/^\s*\/\//m.test(text),
        path,
      );
  }
});
