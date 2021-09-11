const Lab = require('@hapi/lab');
const Code = require('@hapi/code');

const parse = require('../src/transformers/parse');

const { describe, it } = exports.lab = Lab.script();
const { expect } = Code;

describe('parsers', () => {
    it('should return null when no format is specified', () => {
        expect(parse(void 0)).to.be.null();
    });

    it('should parse json', () => {
        const parser = parse('json');
        expect(parser('{"foo": "bar"}')).to.equal({ foo: 'bar' });
    });

    it('should ignore invalid json lines when parsing json', () => {
        const parser = parse('json');
        expect(parser('Oy')).to.be.false();
        expect(parser('"Oy"')).to.be.false();
    });

    it('should parse logfmt', () => {
        const parser = parse('logfmt');
        expect(parser('foo=bar')).to.equal({ foo: 'bar' });
    });

    it('should ignore invalid logfmt lines when parsing logfmt', () => {
        const parser = parse('logfmt');
        expect(parser(void 0)).to.be.false();
    });

    it('should parse regex', () => {
        const parser = parse('\\[(?<severity>\\S+)\\s*(?<delay>\\d+)ms\\] (?<message>.*)');
        expect(parser('[info 20ms] lorem ipsum dolor')).to.equal({
            severity: 'info',
            delay: '20',
            message: 'lorem ipsum dolor',
        });

        expect(parser('foo')).to.be.false();
    });

    describe('tables', () => {
        const tableRows = [
            'NAME     TYPE',
            'foo      bar',
            'baz      qux',
        ];

        it('should ignore headers', () => {
            const pipeline = { firstLine: null };
            const parser = parse('table');
            const line = tableRows[0];
        
            expect(parser(line, line, pipeline)).to.be.false();
        });

        it('should parse subsequent rows', () => {
            const pipeline = { firstLine: tableRows[0] };
            const parser = parse('table');
            let line;

            line = tableRows[1];
            expect(parser(line, line, pipeline)).to.equal({ NAME: 'foo', TYPE: 'bar' });
            line = tableRows[2];
            expect(parser(line, line, pipeline)).to.equal({ NAME: 'baz', TYPE: 'qux' });
        });
    });
});
