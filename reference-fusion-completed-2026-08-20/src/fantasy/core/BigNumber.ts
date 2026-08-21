/**
 * Clean Number Formatter for Fantasy Idle RPG
 * Supports standard incremental suffix notation: 950, 1.25K, 4.81M, 18.3B, 6.42T, etc.
 */
export class BigNumber {
  private static readonly SUFFIXES: readonly string[] = [
    '', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No',
    'Dc', 'UDc', 'DDc', 'TDc', 'QaDc', 'QiDc', 'SxDc', 'SpDc', 'OcDc', 'NoDc'
  ];

  public static format(value: number | string | bigint): string {
    const num = typeof value === 'number' ? value : Number(value);

    if (isNaN(num) || !isFinite(num)) {
      return '0';
    }

    if (num < 0) {
      return '-' + this.format(-num);
    }

    if (num < 1000) {
      if (Number.isInteger(num)) {
        return num.toString();
      }
      return num >= 10 ? num.toFixed(1) : num.toFixed(2);
    }

    const tier = Math.floor(Math.log10(num) / 3);

    if (tier < this.SUFFIXES.length) {
      const suffix = this.SUFFIXES[tier];
      const scale = Math.pow(10, tier * 3);
      const scaled = num / scale;
      
      const formatted = scaled < 10 
        ? scaled.toFixed(2) 
        : scaled < 100 
          ? scaled.toFixed(1) 
          : scaled.toFixed(0);

      return formatted.replace(/\.0$/, '') + suffix;
    }

    return num.toExponential(2).replace('e+', 'e');
  }

  public static formatPercent(ratio: number): string {
    return `${(ratio * 100).toFixed(1)}%`;
  }
}
