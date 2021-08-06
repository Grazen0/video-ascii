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
	async execute(args) {
		if (args.length === 0) {
			throw new Error('No file path provided.');
		}

		const path = resolve(args.join(' '));
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
		const frameFiles: JSZip.JSZipObject[] = [];
		zip.folder('frames')!.forEach((name, file) => frameFiles.push(file));

		const frames = await Promise.all(
			frameFiles.map(file => file.async('string'))
		);

		// Cool countdown
		let count = 3;
		while (count > 0) {
			console.log(`Starting in ${count--}...`);
			await sleep(1000);
		}

		// Reproduce video
		const msPerFrame = 1000 / manifest.fps;
		const start = Date.now();

		let time = 0;
		let index = 0;
		let avg = 0;

		function loop() {
			if (++index >= frames.length) return;

			time += msPerFrame;

			// Schedule next render
			const diff = Date.now() - start - time;
			setTimeout(loop, msPerFrame - diff);

			// Actual render
			console.clear();
			console.log(
				`frame ${index} - innacuracy: ${Math.floor((avg = (avg + diff) / 2))}ms`
			);
			console.log(frames[index]);
		}

		loop();
	},
};
