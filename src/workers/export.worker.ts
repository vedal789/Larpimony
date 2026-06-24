import {
  Output,
  BufferTarget,
  Mp4OutputFormat,
  WebMOutputFormat,
  VideoSampleSource,
  VideoSample,
  AudioSampleSource,
  AudioSample,
} from "mediabunny";
import { GIFEncoder, quantize, applyPalette } from "gifenc";

function buildAudioPayload(
  audioSamples: unknown[],
): { data: Float32Array } | null {
  const validSamples = audioSamples.filter(
    (sample): sample is Float32Array =>
      sample instanceof Float32Array &&
      sample.length >= 2 &&
      sample.length % 2 === 0,
  );

  if (validSamples.length === 0) return null;

  let totalSampleCount = 0;
  for (const sample of validSamples) {
    totalSampleCount += sample.length / 2;
  }

  if (totalSampleCount <= 0) return null;

  const data = new Float32Array(totalSampleCount * 2);
  let offset = 0;

  for (const sample of validSamples) {
    const half = sample.length / 2;
    data.set(sample.subarray(0, half), offset);
    data.set(sample.subarray(half), totalSampleCount + offset);
    offset += half;
  }

  return { data };
}

self.onmessage = async (e: MessageEvent) => {
  const { options, frames, audioSamples, sampleRate, fps, width, height, isChromium } =
    e.data;

  try {
    if (!Array.isArray(frames) || frames.length === 0) {
      throw new Error(
        "Nothing was recorded. Add a block to run when the video starts.",
      );
    }

    if (options.format === "gif") {
      const encoder = GIFEncoder();
      const frameDuration = 1000 / fps;

      const canvas = new OffscreenCanvas(width, height);
      const ctx = canvas.getContext("2d", { willReadFrequently: true });

      if (!ctx) {
        throw new Error("couldn't get 2d context for GIF encoding");
      }

      for (let i = 0; i < frames.length; i++) {
        const bitmap = frames[i] as ImageBitmap;
        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(bitmap, 0, 0, width, height);
        bitmap.close();

        const imageData = ctx.getImageData(0, 0, width, height);
        const { data } = imageData;
        const palette = quantize(data, 256);
        const index = applyPalette(data, palette);

        encoder.writeFrame(index, width, height, {
          palette,
          delay: frameDuration,
        });

        if (i % 5 === 0) {
          self.postMessage({
            type: "progress",
            progress: (i / frames.length) * 100,
          });
        }
      }

      encoder.finish();
      const buffer = encoder.bytes().buffer;
      (self as any).postMessage({ type: "done", buffer }, [buffer]);
      return;
    }

    const isMP4 = options.format === "mp4";
    const frameDuration = 1 / fps;
    const audioPayload = buildAudioPayload(audioSamples);

    const target = new BufferTarget();
    const output = new Output({
      format: isMP4 ? new Mp4OutputFormat() : new WebMOutputFormat(),
      target,
    });
	
	const now = new Date();

    const timestamp = new Intl.DateTimeFormat("sv-SE", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      fractionalSecondDigits: 3,
      timeZoneName: "longOffset",
      hour12: false,
    }).format(now);

    output.setMetadataTags({
      comment: `Edited using Antimony (https://editor.antimony.cc) on ${timestamp}`,
    });

    const videoSource = new VideoSampleSource({
      codec: isMP4 ? "avc" : "vp9",
      bitrate: options.bitrate,
      latencyMode: "realtime",
      keyFrameInterval: Math.max(1, Math.round(fps)),
      colorSpace: {
        primaries: "bt709",
        transfer: "bt709",
        matrix: "bt709",
        fullRange: true,
      },
    } as any);

    const audioSource = audioPayload
      ? new AudioSampleSource({
          codec: isMP4 && isChromium ? "aac" : "opus",
          sampleRate,
          numberOfChannels: 2,
          bitrate: 192000,
        } as any)
      : null;

    output.addVideoTrack(videoSource);
    if (audioSource) output.addAudioTrack(audioSource);
    await output.start();

    if (audioSource && audioPayload) {
      const audioSample = new AudioSample({
        format: "f32-planar",
        sampleRate,
        numberOfChannels: 2,
        timestamp: 0,
        data: audioPayload.data.buffer,
      });
      try {
        await audioSource.add(audioSample);
      } finally {
        audioSample.close();
      }
    }

    for (let i = 0; i < frames.length; i++) {
      const bitmap = frames[i] as ImageBitmap;
      const timestamp = i * frameDuration;
      let sample: VideoSample | null = null;

      try {
        sample = new VideoSample(bitmap, {
          timestamp,
          duration: frameDuration,
          colorSpace: {
            primaries: "bt709",
            transfer: "bt709",
            matrix: "bt709",
            fullRange: true,
          },
        } as any);

        await videoSource.add(sample, { keyFrame: i === 0 || i % Math.max(1, Math.round(fps)) === 0 });
      } finally {
        if (sample) sample.close();
        bitmap.close();
      }

      if (i % 10 === 0) {
        self.postMessage({
          type: "progress",
          progress: (i / frames.length) * 100,
        });
      }
    }

    await videoSource.close();
    if (audioSource) await audioSource.close();
    await output.finalize();

    const buffer = target.buffer as ArrayBuffer;
    (self as any).postMessage({ type: "done", buffer }, [buffer]);
  } catch (err: any) {
    (self as any).postMessage({ type: "error", error: err?.message ?? String(err) });
  }
};