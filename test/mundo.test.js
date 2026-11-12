const test = require('node:test');
const assert = require('node:assert/strict');

const { validateArgs, createWorldObject } = require('../src/mundo');

const validArgs = [
  'node',
  'src/index.js',
  'Una tormenta',
  'Aérpolis',
  'rojo',
  'azul',
  'verde',
  'dorado',
  'violeta',
];

test('valida los siete argumentos y recorta espacios exteriores', () => {
  const args = [...validArgs];
  args[2] = ' Una tormenta ';
  args[4] = ' rojo ';

  assert.deepEqual(validateArgs(args), {
    situacion: 'Una tormenta',
    mundo: 'Aérpolis',
    colores: ['rojo', 'azul', 'verde', 'dorado', 'violeta'],
  });
});

test('rechaza una cantidad de argumentos diferente de siete', () => {
  assert.throws(() => validateArgs(validArgs.slice(0, -1)), /exactamente 7 argumentos/);
});

test('rechaza argumentos vacíos después de recortar espacios', () => {
  const args = [...validArgs];
  args[2] = '   ';

  assert.throws(() => validateArgs(args), /puede estar vacío/);
});

test('rechaza colores repetidos sin distinguir mayúsculas', () => {
  const args = [...validArgs];
  args[8] = 'ROJO';

  assert.throws(() => validateArgs(args), /deben ser distintos/);
});

test('los mismos datos producen el mismo id aunque cambie la fecha', () => {
  const input = validateArgs(validArgs);
  const first = createWorldObject(input);
  const second = createWorldObject(input);

  assert.equal(first.id, second.id);
  assert.equal(first.colores.length, 5);
  assert.ok(first.creadoEn);
});
