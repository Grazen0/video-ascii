import { basename, resolve } from 'path';
import { existsSync } from 'fs';
import fs from 'fs/promises';
import JSZip from 'jszip';
import Command from '../structures/command';
import { MANIFEST_FILE } from '../constants';
import { sleep } from '../utils';

export const play: Command = {
	name: 'play',
	description: 'Plays the specified .vii file',
	usage: '[file]',
	async execute([file]) {
		if (!file) {
			throw new Error('No file path provided.');
		}

		const path = resolve(file);
		if (!existsSync(path)) {
			throw new Error('The provided file path does not exist.');
		}

		const data = await fs.readFile(path);
		const zip = await JSZip.loadAsync(data);

		// Extract manifest.json
		const manifestFile = zip.file(MANIFEST_FILE);
		if (!manifestFile) {
			throw new Error(`"${manifestFile}" file not found.`);
		}

		const manifestRaw = await manifestFile.async('string');
		const manifest = JSON.parse(manifestRaw);

		// Extract frames
		const framesFolder = zip.folder('frames')!;
		const frameFiles = framesFolder.files;
		const frames = await Promise.all(
			Object.values(frameFiles)
				.slice(1)
				.map(file => file.async('string'))
		);

		// Reproduce video
		const msPerFrame = (1 / manifest.fps) * 1000;
		for (const frame of frames) {
			const start = Date.now();

			console.clear();
			console.log(frame);

			const timeLeft = start + msPerFrame - Date.now();
			if (timeLeft > 0) await sleep(timeLeft);
		}
	},
};
