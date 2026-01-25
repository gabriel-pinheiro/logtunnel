const Lab = require('@hapi/lab');
const Code = require('@hapi/code');

const { FindFilter } = require('../src/transformers/filters/find');
const { IgnoreFilter } = require('../src/transformers/filters/ignore');
const { FieldFilter } = require('../src/transformers/filters/field');

const { describe, it } = exports.lab = Lab.script();
const { expect } = Code;

describe('filters', () => {
    describe('--filter', () => {
        it('should accept matching strings', () => {
            const transformer = new FindFilter('psu');
            const result = transformer.run('lorem ipsum dolor sit amet');
            expect(result).to.be.true();
        });

        it('should reject non-matching strings', () => {
            const transformer = new FindFilter('aaa');
            const result = transformer.run('lorem ipsum dolor sit amet');
            expect(result).to.be.false();
        });

        it('should be case insensitive', () => {
            const transformer = new FindFilter('PsU');
            const result = transformer.run('lorem ipSUm dolor sit amet');
            expect(result).to.be.true();
        });

        it('should support regex', () => {
            const transformer = new FindFilter('i.*m');
            const result = transformer.run('lorem ipsum dolor sit amet');
            expect(result).to.be.true();
        });
    });
    describe('--ignore', () => {
        it('should reject matching strings', () => {
            const transformer = new IgnoreFilter('psu');
            const result = transformer.run('lorem ipsum dolor sit amet');
            expect(result).to.be.false();
        });

        it('should accept non-matching strings', () => {
            const transformer = new IgnoreFilter('aaa');
            const result = transformer.run('lorem ipsum dolor sit amet');
            expect(result).to.be.true();
        });

        it('should be case insensitive', () => {
            const transformer = new IgnoreFilter('PsU');
            const result = transformer.run('lorem ipSUm dolor sit amet');
            expect(result).to.be.false();
        });

        it('should support regex', () => {
            const transformer = new IgnoreFilter('i.*m');
            const result = transformer.run('lorem ipsum dolor sit amet');
            expect(result).to.be.false();
        });
    });
    describe('--field', () => {
        it('should error when strings wasn\'t parsed into object', async () => {
            const transformer = new FieldFilter('a');
            expect(transformer.run('a')).to.reject();
        });

        it('should compare equality', async () => {
            const transformer = new FieldFilter('eq foo "bar"');
            expect(await transformer.run({ foo: 'bar' })).to.be.true();
            expect(await transformer.run({ foo: 'baz' })).to.be.false();
        });

        it('should compare inequality with strings', async () => {
            const transformer = new FieldFilter('gte foo 3');
            expect(await transformer.run({ foo: '3' })).to.be.true();
            expect(await transformer.run({ foo: '2' })).to.be.false();
        });

        it('should accept javascript', async () => {
            const transformer = new FieldFilter('includes (lower foo) "bar"');
            expect(await transformer.run({ foo: 'ABARA' })).to.be.true();
            expect(await transformer.run({ foo: 'ABADA' })).to.be.false();
        });
    });
});
