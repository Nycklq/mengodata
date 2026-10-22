import assert from 'node:assert/strict';
import test from 'node:test';
import { describeDatabaseError } from '../src/infrastructure/persistence/database-error.js';

test('database authorization failure preserves SQLSTATE without exposing connection details', () => {
  const error = Object.assign(
    new Error('postgresql://role:synthetic-secret@host/database'),
    { code: '28000', detail: 'synthetic-secret', query: 'private query' },
  );
  const diagnostic = describeDatabaseError(error);
  assert.equal(diagnostic.code, 'DATABASE_AUTHORIZATION_REJECTED');
  assert.equal(diagnostic.sqlstate, '28000');
  assert.ok(!JSON.stringify(diagnostic).includes('synthetic-secret'));
  assert.ok(!JSON.stringify(diagnostic).includes('private query'));
});

test('database diagnostics distinguish credentials, privileges and incompatible schema', () => {
  assert.equal(
    describeDatabaseError({ code: '28P01' }).code,
    'DATABASE_AUTHENTICATION_FAILED',
  );
  assert.equal(
    describeDatabaseError({ code: '42501' }).code,
    'DATABASE_PERMISSION_DENIED',
  );
  assert.equal(
    describeDatabaseError({ code: '42703' }).code,
    'DATABASE_COLUMN_NOT_FOUND',
  );
  assert.equal(describeDatabaseError({ code: 'ECONNREFUSED' }).sqlstate, null);
});

test('unexpected database failures never echo arbitrary error messages or codes', () => {
  const diagnostic = describeDatabaseError({
    message: 'synthetic-password',
    code: 'synthetic-password',
  });
  assert.equal(diagnostic.code, 'DATABASE_OPERATION_FAILED');
  assert.equal(diagnostic.sqlstate, null);
  assert.ok(!JSON.stringify(diagnostic).includes('synthetic-password'));
});
