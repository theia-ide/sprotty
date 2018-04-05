/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

/**
 * Slows down animations towards the begin and the end.
 *
 * @param x the value between 0 (start of animation) and 1 (end of
 *     animation) linearly interpolated in time.
 * @returns {number} the eased value between 0 and 1
 */
export function easeInOut(x: number): number {
    if (x < 0.5)
        return x * x * 2;
    else
        return 1 - (1 - x) * (1 - x) * 2;
}
