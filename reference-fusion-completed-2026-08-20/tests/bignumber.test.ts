import { describe, it, expect } from 'vitest';
import { BigNumber } from '../src/core/BigNumber';

describe('BigNumber & NumberFormatter', () => {
  it('should format small numbers accurately', () => {
    expect(BigNumber.format(0)).toBe('0');
    expect(BigNumber.format(42)).toBe('42');
    expect(BigNumber.format(999)).toBe('999');
  });

  it('should format thousands and millions with standard suffixes', () => {
    expect(BigNumber.format(1000)).toBe('1K');
    expect(BigNumber.format(1500)).toBe('1.5K');
    expect(BigNumber.format(83700)).toBe('83.7K');
    expect(BigNumber.format(1250000)).toBe('1.25M');
    expect(BigNumber.format(4820000000)).toBe('4.82B');
    expect(BigNumber.format(7130000000000)).toBe('7.13T');
  });

  it('should handle large incremental scales (Quadrillions and beyond)', () => {
    expect(BigNumber.format(1e15)).toBe('1Qa');
    expect(BigNumber.format(2.5e18)).toBe('2.5Qi');
    expect(BigNumber.format(9e21)).toBe('9Sx');
  });

  it('should format scientific notation if requested', () => {
    expect(BigNumber.format(1250000, 'scientific')).toBe('1.25e6');
  });

  it('should safely format NaN and Infinity to 0', () => {
    expect(BigNumber.format(NaN)).toBe('0');
    expect(BigNumber.format(Infinity)).toBe('0');
    expect(BigNumber.format(-Infinity)).toBe('0');
  });

  it('should format time correctly', () => {
    expect(BigNumber.formatTime(45)).toBe('00:45');
    expect(BigNumber.formatTime(125)).toBe('02:05');
    expect(BigNumber.formatTime(3665)).toBe('01:01:05');
  });
});
