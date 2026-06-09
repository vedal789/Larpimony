import {
	Output,
	BufferTarget,
	Mp4OutputFormat,
	WebMOutputFormat,
	VideoSampleSource,
	VideoSample,
} from 'mediabunny';

self.onmessage = async (e: MessageEvent) => {
	const { options, frames, width, height, fps } = e.data;

	try {
		if (options.format === 'gif') {
			self.postMessage({ type: 'error', error: 'so uhh.. this is awkward. i couldnt find a way for GIF exporting to work on a thread, so this is what you get. TODO: fix this' });
			return;
		}

		const isMP4 = options.format === 'mp4';
		const frameDuration = 1 / fps;

		const target = new BufferTarget();
		const output = new Output({
			format: isMP4 ? new Mp4OutputFormat() : new WebMOutputFormat(),
			target,
		});

		const videoSource = new VideoSampleSource({
			codec: isMP4 ? 'avc' : 'vp9',
			bitrate: options.bitrate,
			latencyMode: options.quality,
		});

		output.addVideoTrack(videoSource);
		await output.start();

		for (let i = 0; i < frames.length; i++) {
			const bitmap = frames[i] as ImageBitmap;
			const timestamp = i * frameDuration;
			const sample = new VideoSample(bitmap, { timestamp, duration: frameDuration });

			await videoSource.add(sample, { keyFrame: i % 60 === 0 });
			sample.close();
			bitmap.close();

			if (i % 10 === 0) {
				self.postMessage({ type: 'progress', progress: (i / frames.length) * 100 });
			}
		}

		videoSource.close();
		await output.finalize();

		const buffer = target.buffer as ArrayBuffer;
		(self as any).postMessage({ type: 'done', buffer }, [buffer]);
	} catch (err: any) {
		(self as any).postMessage({ type: 'error', error: err.message });
	}
};