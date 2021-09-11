const Podium = require("@hapi/podium");

const stdin = new Podium('log-line');
let incompleteLine = '';

process.stdin.on('data', data => {
    const lines = data.toString()
        .split(/[\r\n|\n]/);
    
    lines[0] = incompleteLine + lines[0];
    incompleteLine = lines.pop(); // Either an incomplete line or an empty string due to the last \n

    lines.filter(line => line.length > 0)
        .forEach(line => stdin.emit('log-line', line));
});

module.exports.stdin = stdin;
