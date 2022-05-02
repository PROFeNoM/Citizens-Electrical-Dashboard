/** Convert a value from one range to another */
export function changeRange(n: number, minOld: number, maxOld: number, minNew: number, maxNew: number) {
	if (n > maxOld)
		return maxNew;
	if (n < minOld)
		return minNew;
	if (minOld === maxOld)
		return minNew;  // Arbitrary choice; could have been maxNew as well
	return ((n - minOld) / (maxOld - minOld)) * (maxNew - minNew) + minNew;
}

export function wattsToKilowatts(watts: number) {
	return Math.round(watts / 1000);
}

export function wattsToMegaWatts(watts: number) {
	return Math.round(watts / 1000000);
}
