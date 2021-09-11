const Code = require('@hapi/code');
const Hoek = require('@hapi/hoek');
const { logSource } = require('../../src/log-source');
const { pod, slowPod } = require('../utils');

const { expect } = Code;

module.exports.run = ({ it }) => () => {

    it('must split into lines with LF', async () => {
        const source = pod('hello\nworld\n');
        const output = logSource(source);
        const lines = [];

        output.on('log-line', l => lines.push(l));
        await output.once('end');

        expect(lines).to.equal(['hello', 'world']);
    });

    it('must split into lines with CRLF', async () => {
        const source = pod('hello\r\nworld\r\n');
        const output = logSource(source);
        const lines = [];

        output.on('log-line', l => lines.push(l));
        await output.once('end');

        expect(lines).to.equal(['hello', 'world']);
    });

    it('must join incomplete lines', async () => {
        const source = pod('hello\nwor', 'ld\n:)\n');
        const output = logSource(source);
        const lines = [];

        output.on('log-line', l => lines.push(l));
        await output.once('end');

        expect(lines).to.equal(['hello', 'world', ':)']);
    });

    it('must flush incomplete lines on end', async () => {
        const source = pod('hello\nworld');
        const output = logSource(source);
        const lines = [];

        output.on('log-line', l => lines.push(l));
        await output.once('end');

        expect(lines).to.equal(['hello', 'world']);
    });

    it('must not wait for end or line completion to send lines', async () => {
        const source = slowPod('hello\nwo', 'rld\n:)');
        const output = logSource(source);
        const lines = [];
        output.on('log-line', l => lines.push(l));

        await Hoek.wait(50);
        expect(lines).to.equal(['hello']);

        await Hoek.wait(100);
        expect(lines).to.equal(['hello', 'world']);

        await Hoek.wait(100);
        expect(lines).to.equal(['hello', 'world', ':)']);
    });
};
