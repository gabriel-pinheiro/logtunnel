const Lab = require('@hapi/lab');
const Code = require('@hapi/code');

const output = require('../src/transformers/output');

const { describe, it } = exports.lab = Lab.script();
const { expect } = Code;

describe('outputs', () => {
    it('should should not modify unparsed when unset', () => {
        const format = output();
        expect(format('foo')).to.be.true();
    });

    it('should prettify parsed lines when unset', () => {
        const format = output();
        const line = format({ foo: 'bar' });
        expect(line).to.be.a.string();
        expect(line).to.match(/\{.*foo.*:.*bar.*\}/);
    });

    it('should format as json', () => {
        const format = output('json');
        const line = format({ foo: 'bar' });
        expect(line).to.equal('{"foo":"bar"}');
    });

    it('should format as logfmt', () => {
        const format = output('logfmt');
        const line = format({ foo: 'bar' });
        expect(line).to.equal('foo=bar');
    });

    it('should format as original', () => {
        const format = output('original');
        const line = format({ foo: 'bar' }, 'fubá');
        expect(line).to.equal('fubá');
    });

    it('should format with mustache', () => {
        const format = output('[{{foo}}]');
        const line = format({ foo: 'bar' });
        expect(line).to.equal('[bar]');
    });

    it('should refuse to format unparsed lines', () => {
        expect(() => output('json')('foo')).to.throw();
        expect(() => output('logfmt')('foo')).to.throw();
        expect(() => output('{{foo}}')('foo')).to.throw();
    });
});
