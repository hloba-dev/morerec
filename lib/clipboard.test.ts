import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isClipboardReadDenied } from './clipboard.ts';

function fakePermissions(result: (() => Promise<{ state: string }>) | undefined) {
  return result ? { query: result } : undefined;
}

test('нет Permissions API -> не считаем запрещённым', async () => {
  assert.equal(await isClipboardReadDenied(undefined), false);
});

test('Safari/Firefox: query бросает на clipboard-read -> не запрещено', async () => {
  const p = fakePermissions(() => Promise.reject(new TypeError('unsupported')));
  assert.equal(await isClipboardReadDenied(p), false);
});

test('Chrome: состояние denied -> запрещено', async () => {
  const p = fakePermissions(() => Promise.resolve({ state: 'denied' }));
  assert.equal(await isClipboardReadDenied(p), true);
});

test('Chrome: prompt/granted -> не запрещено (пользователь просто отменил)', async () => {
  assert.equal(
    await isClipboardReadDenied(fakePermissions(() => Promise.resolve({ state: 'prompt' }))),
    false,
  );
  assert.equal(
    await isClipboardReadDenied(fakePermissions(() => Promise.resolve({ state: 'granted' }))),
    false,
  );
});
