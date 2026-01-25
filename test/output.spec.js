const Lab = require('@hapi/lab');
const Code = require('@hapi/code');

const { outputFactory } = require('../src/transformers/outputs/factory');

const { describe, it } = exports.lab = Lab.script();
const { expect } = Code;

describe('outputs', () => {
    it('should should not modify unparsed when unset', () => {
        const format = outputFactory();
        expect(format.run('foo')).to.be.true();
    });

    it('should inspect parsed lines single-line when unset', () => {
        const format = outputFactory();
        const line = format.run({ foo: 'bar' });
        expect(line).to.be.a.string();
        expect(line).to.match(/\{.*foo.*:.*bar.*\}/);
        expect(line.split('\n').length).to.equal(1);
    });

    it('should inspect parsed lines multi-line', () => {
        const format = outputFactory('inspect');
        const line = format.run({ foo: 'bar' });
        expect(line).to.be.a.string();
        expect(line.split('\n').join(' ')).to.match(/\{.*foo.*:.*bar.*\}/);
        expect(line.split('\n').length).to.equal(3);
    });

    it('should format as json', () => {
        const format = outputFactory('json');
        const line = format.run({ foo: 'bar' });
        expect(line).to.equal('{"foo":"bar"}');
    });

    it('should format as logfmt', () => {
        const format = outputFactory('logfmt');
        const line = format.run({ foo: 'bar' });
        expect(line).to.equal('foo=bar');
    });

    it('should format as original', () => {
        const format = outputFactory('original');
        const line = format.run({ foo: 'bar' }, 'fubá');
        expect(line).to.equal('fubá');
    });

    it('should format with bigodon', async () => {
        const format = outputFactory('[{{foo}}]');
        const line = await format.run({ foo: 'bar' });
        expect(line).to.equal('[bar]');
    });

    it('should allow bigodon helpers', async () => {
        const format = outputFactory('[{{upper foo }}]');
        const line = await format.run({ foo: 'bar' });
        expect(line).to.equal('[BAR]');
    });

    it('should refuse to format unparsed lines', async () => {
        expect(() => outputFactory('json').run('foo')).to.throw();
        expect(() => outputFactory('logfmt').run('foo')).to.throw();
        await expect(outputFactory('{{foo}}').run('foo')).to.reject();
    });
});
