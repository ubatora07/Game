/**
 * BigNumber & NumberFormatter
 * Handles precise representation and human-friendly formatting of incremental game numbers.
 * Supports up to standard scientific/suffix notation (1e308 and custom strings).
 */

export class BigNumber {
  /**
   * Suffixes used for incremental numbers
   */
  private static readonly SUFFIXES: readonly string[] = [
    '', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No',
    'Dc', 'UDc', 'DDc', 'TDc', 'QaDc', 'QiDc', 'SxDc', 'SpDc', 'OcDc', 'NoDc',
    'Vg', 'UVg', 'DVg', 'TVg', 'QaVg', 'QiVg', 'SxVg', 'SpVg', 'OcVg', 'NoVg',
    'Tg', 'UTg', 'DTg', 'TTg', 'QaTg', 'QiTg', 'SxTg', 'SpTg', 'OcTg', 'NoTg',
    'Qd', 'UQd', 'DQd', 'TQd', 'QaQd', 'QiQd', 'SxQd', 'SpQd', 'OcQd', 'NoQd',
    'Qq', 'UQq', 'DQq', 'TQq', 'QaQq', 'QiQq', 'SxQq', 'SpQq', 'OcQq', 'NoQq',
    'Sg', 'USg', 'DSg', 'TSg', 'QaSg', 'QiSg', 'SxSg', 'SpSg', 'OcSg', 'NoSg',
    'St', 'USt', 'DSt', 'TSt', 'QaSt', 'QiSt', 'SxSt', 'SpSt', 'OcSt', 'NoSt',
    'Og', 'UOg', 'DOg', 'TOg', 'QaOg', 'QiOg', 'SxOg', 'SpOg', 'OcOg', 'NoOg',
    'Nn', 'UNn', 'DNn', 'TNn', 'QaNn', 'QiNn', 'SxNn', 'SpNn', 'OcNn', 'NoNn',
    'Ce', 'UCe', 'DCe', 'TCe', 'QaCe', 'QiCe', 'SxCe', 'SpCe', 'OcCe', 'NoCe'
  ];

  /**
   * Format a number using standard suffix notation (e.g. 1.25M, 83.7K)
   * or scientific notation if requested or above suffix limit.
   */
  public static format(value: number | string | bigint, notation: 'standard' | 'scientific' = 'standard'): string {
    const num = typeof value === 'number' ? value : Number(value);

    if (isNaN(num) || !isFinite(num)) {
      return '0';
    }

    if (num < 0) {
      return '-' + this.format(-num, notation);
    }

    if (num < 1000) {
      if (Number.isInteger(num)) {
        return num.toString();
      }
      return num >= 10 ? num.toFixed(1) : num.toFixed(2);
    }

    if (notation === 'scientific') {
      return num.toExponential(2).replace('e+', 'e');
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

      // Strip unnecessary trailing zeros e.g. "1.00" -> "1"
      return formatted.replace(/\.00$/, '').replace(/(\.[1-9])0$/, '$1') + suffix;
    }

    return num.toExponential(2).replace('e+', 'e');
  }

  /**
   * Format time in HH:MM:SS or MM:SS
   */
  public static formatTime(seconds: number): string {
    const totalSecs = Math.max(0, Math.floor(seconds));
    const h = Math.floor(totalSecs / 3600);
    const m = Math.floor((totalSecs % 3600) / 60);
    const s = totalSecs % 60;

    const pad = (n: number) => n.toString().padStart(2, '0');

    if (h > 0) {
      return `${pad(h)}:${pad(m)}:${pad(s)}`;
    }
    return `${pad(m)}:${pad(s)}`;
  }
}
