/**
 * Slows down animations towards the begin and the end.
 *
 * @param number the value between 0 (start of animation) and 1 (end of
 * animation) linearly interpolated in time.
 * @returns {number} the eased value between 0 and 1
 */
export function easeInOut(number): number {
    if (number < 0.5)
        return number * number * 2
    else
        return 1 - (1 - number) * (1 - number) * 2
}