export class TimeService {
  /**
   * Returns the current time in milliseconds.
   * Currently uses Date.now(), but can be swapped to Yandex Server Time later
   * to prevent local clock manipulation.
   */
  public static now(): number {
    return Date.now();
  }

  /**
   * Returns the midnight timestamp (start of day) for the given time.
   */
  public static getMidnight(timestamp: number): number {
    const d = new Date(timestamp);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  }
}
