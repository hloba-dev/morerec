import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalizePasted } from './paste.ts';

test('обрезает пробелы и переносы строк по краям', () => {
  assert.equal(normalizePasted('  2200 1234 5678 9012 \n'), '2200 1234 5678 9012');
});

test('сворачивает переносы строк и повторные пробелы в один пробел', () => {
  assert.equal(normalizePasted('+7 912\n345-67-89'), '+7 912 345-67-89');
  assert.equal(normalizePasted('2200   1234\t5678'), '2200 1234 5678');
});

test('не меняет формат номера', () => {
  assert.equal(normalizePasted('+7 (912) 345-67-89'), '+7 (912) 345-67-89');
});

test('пустой буфер -> пустая строка', () => {
  assert.equal(normalizePasted('   \n '), '');
  assert.equal(normalizePasted(''), '');
});
