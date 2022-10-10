import readline from "readline";

export function readInput(txt, pwd) {
  return new Promise((resolve, reject) => {
    var rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    if (pwd) rl.stdoutMuted = true;

    rl.question(`[?] ${txt}`, function(input) {
      rl.close();
      resolve(input);
    });

    rl._writeToOutput = function _writeToOutput(stringToWrite) {
      if (rl.stdoutMuted) rl.output.write("*");
      else rl.output.write(stringToWrite);
    };
  });
}

export function readPasswd(txt) {
  return readInput(txt, true);
}

export function sanitizeName(n) {
  return n
    .replace(/ /gm, "_")
    .replace(/"/gm, '"')
    .replace(/'/gm, "_")
    .replace(/,/gm, "_")
    .replace(/:/gm, "_");
}

export function printInfo(text) {
  console.log(`[-] ${text}`);
}

export function printWarn(text) {
  console.log(`[!] ${text}`);
}

export function printError(text) {
  console.log(`[x] ${text}`);
}

export function printQuestion(text) {
  console.log(`[?] ${text}`);
}
