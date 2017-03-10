export function easeInOut(number): number {
    if (number < 0.5)
        return number * number * 2
    else
        return 1 - (1 - number) * (1 - number) * 2
}