import FFmpeg from 'ffmpeg';
import ffmpegPath from 'ffmpeg-static';
import ascii from 'ascii-converter';
import fs from 'fs';
import { basename, resolve } from 'path';
import tmp from 'tmp';
import JSZip from 'jszip';
import yesno from 'yesno';
import Command from '../structures/command';
import { floorDecimals, getFrameIndex } from '../utils';
import {
	FRAMES_FOLDER,
	MANIFEST_FILE,
	MAX_HEIGHT,
	MAX_WIDTH,
} from '../constants';

tmp.setGracefulCleanup();

export const convert: Command = {
	name: 'convert',
	description: 'Generates a .vii file from the provided video file path.',
	usage: '[file]',
	async execute([file]) {
		if (!file) {
			throw new Error('No file path provided.');
		}

		const path = resolve(file);
		if (!fs.existsSync(path)) {
			throw new Error('The provided file path does not exist.');
		}

		const target = path.replace(/\.[^.]+$/, '') + '.vii';
		if (fs.existsSync(resolve(target))) {
			const ok = await yesno({
				question: `The file "${basename(
					target
				)}" already exists. Are you sure you want to overwrite it? [y/n]`,
				invalid: () => {},
			});
			if (!ok) {
				console.log('Ok.');
				return;
			}
		}

		console.log('Reading file...');
		const ffmpeg = new FFmpeg(path);
		(ffmpeg as any).bin = ffmpegPath; // Set ffmpeg-static path

		const video = await ffmpeg;
		const dir = tmp.dirSync();

		console.log('Extracting video frames...');
		const paths = await video.fnExtractFrameToJPG(dir.name);
		paths.sort((a, b) => getFrameIndex(a) - getFrameIndex(b));

		let {
			fps,
			resolution: { w = 0, h = 0 },
		} = (video.metadata as any).video;

		// Scale width
		if (w > MAX_WIDTH) {
			const ratio = MAX_WIDTH / w;
			w *= ratio;
			h *= ratio;
		}

		// Scale height
		if (h > MAX_HEIGHT) {
			const ratio = MAX_HEIGHT / h;
			w *= ratio;
			h *= ratio;
		}

		console.log('Converting frames into ASCII...');
		const frames = await Promise.all(
			paths.map(frame =>
				ascii(frame, {
					width: Math.floor(w),
					height: Math.floor(h / 2),
				})
			)
		);
		dir.removeCallback();

		console.log('Zipping file...');
		const zip = new JSZip();
		const framesFolder = zip.folder(FRAMES_FOLDER)!;

		// Zip frames
		for (let i = 0; i < frames.length; i++) {
			framesFolder.file(i.toString(), frames[i]);
		}

		// Zip manifest
		const manifest = {
			fps,
			duration: video.metadata.duration!.seconds,
		};
		zip.file(MANIFEST_FILE, JSON.stringify(manifest));

		console.log('Saving...');
		const buf = await zip.generateAsync({ type: 'nodebuffer' });
		fs.writeFileSync(target, buf);

		const mb = floorDecimals(buf.length / Math.pow(2, 20), 2);
		console.log(`${mb} MB written to "${target}"`);
		console.log('Done!');
	},
};
