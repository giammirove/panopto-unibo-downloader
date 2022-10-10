import ffmpeg from 'fluent-ffmpeg';
import cliProgress from 'cli-progress';

const progress = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);

export function convertM3u8ToMp4(input, output) {
  return new Promise((resolve, reject) => {
    if (!input || !output) {
      reject(new Error("Eh devi inserire tutti i campi!"));
      return;
    }

    function nullFunc() { }
    function onStart() {
      progress.start(100, 0);
    }
    function onProgress(e) {
      progress.update(parseInt(e.percent));
    }
    function onError(e) {
      reject(new Error("Qualcosa e' andato storto!"));
    }

    ffmpeg(input)
      .on('start', onStart)
      .on('codecData', nullFunc)
      .on('progress', onProgress)
      .on("error", onError)
      .on('stderr', nullFunc)
      .on("end", (...args) => {
        progress.stop();
        resolve();
      })
      .outputOptions("-c copy")
      .outputOptions("-bsf:a aac_adtstoasc")
      .output(output)
      .run();
  });
}
