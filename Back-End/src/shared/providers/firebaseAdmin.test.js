const test = require('node:test');
const assert = require('node:assert/strict');

const { getFirebaseAuthMode } = require('./firebaseAdmin');

test('deve ativar bypass local quando não houver credenciais do Firebase', () => {
  const original = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  delete process.env.GOOGLE_APPLICATION_CREDENTIALS;

  try {
    assert.equal(getFirebaseAuthMode(), 'bypass');
  } finally {
    if (original === undefined) delete process.env.GOOGLE_APPLICATION_CREDENTIALS;
    else process.env.GOOGLE_APPLICATION_CREDENTIALS = original;
  }
});
