const Podium = require('@hapi/podium');
const Hoek = require('@hapi/hoek');
const { LogPipeline } = require('../src/pipeline');

function pod(...strs) {
    const emitter = new Podium(['data', 'end']);

    (async () => {
        await Hoek.wait(0);
        for(const str of strs) {
            emitter.emit('data', str);
        }
        emitter.emit('end');
    })();

    return emitter;
}

function slowPod(...strs) {
    const emitter = new Podium(['data', 'end']);

    (async () => {
        await Hoek.wait(0);
        for(const str of strs) {
            emitter.emit('data', str);
            await Hoek.wait(100);
        }
        emitter.emit('end');
    })();

    return emitter;
}

function runPipeline(inputLines, args) {
    const lines = [];

    const stdout = { write: (line) => lines.push(line) };
    const pipeline = new LogPipeline(mergeArgs(args), stdout);

    inputLines.forEach(line => pipeline.onLogLine(line));

    // Removing \n from the end of each line
    return lines.map(line => line.slice(0, -1));
}

function mergeArgs(args) {
    let argsObj = {
        filter: [],
        ignore: [],
        field: [],
    };

    args.forEach(arg => argsObj = Hoek.merge(argsObj, arg));

    return argsObj;
}

const _ = str => ({ _: str });
const f = str => ({ filter: [str] });
const i = str => ({ ignore: [str] });
const F = str => ({ field: [str] });
const p = str => ({ parser: str });
const o = str => ({ output: str });
const H = () => ({ headers: true });

module.exports = { pod, slowPod, runPipeline, _, f, i, F, p, o, H };
