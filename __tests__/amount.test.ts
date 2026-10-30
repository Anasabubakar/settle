import { amountToStroops, minorToInput, parseMinorAmount, parseServerMinor, stroopsToAmount } from '@/services/amount';

describe('parseMinorAmount', () => {
  it.each([
    ['12', 1200],
    ['12.5', 1250],
    ['12.50', 1250],
    ['1,250.75', 125075],
    ['19.99', 1999],
    ['0.29', 29],
    ['  7 ', 700],
  ])('parses %s', (input, expected) => expect(parseMinorAmount(input)).toBe(expected));

  it.each(['', 'abc', '-5', '1.234', '1e3', '1.2.3', '.', '0', '99999999999999999'])('rejects %p', (input) => {
    expect(parseMinorAmount(input)).toBe(0);
  });

  it('does not lose cents to floating point', () => {
    expect(parseMinorAmount('1.15')).toBe(115);
    expect(parseMinorAmount('4.35')).toBe(435);
  });
});

describe('minorToInput', () => {
  it('round trips', () => {
    for (const minor of [100, 1250, 1999, 5, 4860000]) expect(parseMinorAmount(minorToInput(minor))).toBe(minor);
  });
  it('drops cents when whole', () => expect(minorToInput(1200)).toBe('12'));
});

describe('parseServerMinor', () => {
  it('accepts integer strings only', () => {
    expect(parseServerMinor('4860000')).toBe(4860000);
    expect(parseServerMinor('12.5')).toBeNull();
    expect(parseServerMinor('-1')).toBeNull();
    expect(parseServerMinor(undefined)).toBeNull();
  });
});

describe('stroops', () => {
  it('converts both ways without floats', () => {
    expect(amountToStroops('10.0000000')).toBe(100000000n);
    expect(amountToStroops('0.0000001')).toBe(1n);
    expect(amountToStroops('1.5')).toBe(15000000n);
    expect(amountToStroops('1.12345678')).toBeNull();
    expect(stroopsToAmount(100000000n)).toBe('10.0000000');
    expect(stroopsToAmount(1n)).toBe('0.0000001');
  });
});
