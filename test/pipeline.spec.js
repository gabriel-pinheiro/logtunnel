const Lab = require('@hapi/lab');
const Code = require('@hapi/code');
const { runPipeline, _, f, i, F, p, o, H } = require('./utils');

const { describe, it } = exports.lab = Lab.script();
const { expect } = Code;

describe('pipeline', () => {
    it('should remove rejected lines and keep accepted ones', () => {
        const args = [
            f('potato')
        ];
        const actual = runPipeline([
            'yada yada yada',
            'lorem ipsum POTATO dolor',
            'ablueblue POTATO',
            'foo bar',
        ], args);
        const expected = [
            'lorem ipsum POTATO dolor',
            'ablueblue POTATO',
        ];

        expect(actual).to.equal(expected);
    });

    it('should apply multiple filters', () => {
        const args = [
            f('foo'),
            f('bar'),
            i('nope'),
        ];
        const actual = runPipeline([
            '1. foo',
            '2. foo bar nope',
            '3. foo bar',
            '4. bar',
        ], args);
        const expected = [
            '3. foo bar',
        ];

        expect(actual).to.equal(expected);
    });

    it('should apply default argument as filter', () => {
        const args = [
            _('foo'),
            i('bar'),
        ];
        const actual = runPipeline([
            '1. foo',
            '2. foo bar',
            '3. baz',
        ], args);
        const expected = [
            '1. foo',
        ];

        expect(actual).to.equal(expected);
    });

    it('should parse and format correctly', () => {
        const args = [
            p('logfmt'),
            o('json'),
        ];
        const actual = runPipeline([
            'foo=bar baz=qux',
        ], args);
        const expected = [
            '{"foo":"bar","baz":"qux"}',
        ];

        expect(actual).to.equal(expected);
    });

    it('should filter by the original line even when parsers and outputs are provided', () => {
        const args = [
            p('logfmt'),
            o('json'),
            i('o=n'),
        ];
        const actual = runPipeline([
            'foo=bar baz=qux',
            'foo=nope baz=qux',
        ], args);
        const expected = [
            '{"foo":"bar","baz":"qux"}',
        ];

        expect(actual).to.equal(expected);
    });

    it('should apply field filters after parse', () => {
        const args = [
            p('logfmt'),
            o('json'),
            F('foo.startsWith("b")'),
        ];
        const actual = runPipeline([
            'foo=bar baz=qux',
            'foo=nope baz=qux',
        ], args);
        const expected = [
            '{"foo":"bar","baz":"qux"}',
        ];

        expect(actual).to.equal(expected);
    });

    it('should apply multiple field filters', () => {
        const args = [
            p('logfmt'),
            o('json'),
            F('foo.startsWith("b")'),
            F('foo.endsWith("r")'),
        ];
        const actual = runPipeline([
            'foo=baz baz=qux',
            'foo=bar baz=qux',
            'foo=tar baz=qux',
        ], args);
        const expected = [
            '{"foo":"bar","baz":"qux"}',
        ];

        expect(actual).to.equal(expected);
    });

    it('should log headers when -H is provided', () => {
        const args = [
            p('table'),
            o('original'),
            F('NAME === "foo"'),
            H(),
        ];
        const actual = runPipeline([
            'NAME',
            'foo',
            'bar',
        ], args);
        const expected = [
            'NAME',
            'foo',
        ];

        expect(actual).to.equal(expected);
    });
});
