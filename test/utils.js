const Podium = require('@hapi/podium');
const Hoek = require('@hapi/hoek');

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

module.exports = { pod, slowPod };
