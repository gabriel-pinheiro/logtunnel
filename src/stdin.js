const Podium = require("@hapi/podium");

const stdin = new Podium('log-line');

process.stdin.on('data', (data) => {
    data.toString()
        .split('\n')
        .filter(l => l.length > 0)
        .forEach(l => stdin.emit('log-line', l));
});

module.exports.stdin = stdin;
