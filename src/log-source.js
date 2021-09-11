const Podium = require("@hapi/podium");

module.exports.logSource = emitter => {
    const source = new Podium(['log-line', 'end']);
    let incompleteLine = '';

    emitter.on('data', data => {
        const lines = data.toString()
            .split(/[\r\n|\n]/);
    
        lines[0] = incompleteLine + lines[0];
        incompleteLine = lines.pop(); // Either an incomplete line or an empty string due to the last \n

        lines.filter(line => line.length > 0)
            .forEach(line => source.emit('log-line', line));
    });

    emitter.on('end', () => {
        if(incompleteLine.length > 0) {
            source.emit('log-line', incompleteLine);
        }
        source.emit('end');
    });

    return source;
};
