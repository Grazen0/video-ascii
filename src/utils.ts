import path from 'path';

export function getFrameIndex(framePath: string) {
	const filename = path.basename(framePath);
	const match = filename.match(/[0-9]+/);

	if (!match) {
		throw new Error(`Couldn't find frame index in file ${framePath}`);
	}

	return Number(match[0]);
}

export function floorDecimals(num: number, decimals: number) {
	const inc = 10 ** decimals;
	return Math.floor(num * inc) / inc;
}

export function sleep(ms: number): Promise<void> {
	return new Promise(resolve => setTimeout(resolve, ms));
}
