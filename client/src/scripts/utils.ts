/**
 *  Convert watts to kilowatts.
 * 
 * @param watts Energy in watts
 * @returns Energy in kilowatts
 */
export function wattsToKilowatts(watts: number) {
	return watts / 1000;
}

/**
 *  Convert watts to megawatts.
 * 
 * @param watts Energy in watts
 * @returns Energy in megawatts
 */
export function wattsToMegawatts(watts: number) {
	return watts / 1_000_000;
}

/**
 * Convert a value from one range to another.
 * 
 * @param n Value to convert
 * @param minOld Old minimum value
 * @param maxOld Old maximum value
 * @param minNew New minimum value
 * @param maxNew New maximum value
 */
 export function changeRange(n: number, minOld: number, maxOld: number, minNew: number, maxNew: number) {
	if (n > maxOld)
		return maxNew;
	if (n < minOld)
		return minNew;
	if (minOld === maxOld)
		return minNew;  // Arbitrary choice, could have been maxNew as well
	return ((n - minOld) / (maxOld - minOld)) * (maxNew - minNew) + minNew;
}
