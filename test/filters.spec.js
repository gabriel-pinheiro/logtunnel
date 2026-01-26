const Lab = require('@hapi/lab');
const Code = require('@hapi/code');

const { FindFilter } = require('../src/transformers/filters/find');
const { IgnoreFilter } = require('../src/transformers/filters/ignore');
const { FieldFilter } = require('../src/transformers/filters/field');
const { SelectFilter } = require('../src/transformers/filters/select');

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

    describe('--select', () => {
        it('should error when strings weren\'t parsed into object', async () => {
            const transformer = new SelectFilter('foo');
            expect(transformer.run('a')).to.reject();
        });

        it('should select only selected field (1 field)', async () => {
            const transformer = new SelectFilter('foo');
            const result = await transformer.run({ foo: 'bar', baz: 'qux', extra: 'nope' });
            expect(result).to.equal({ foo: 'bar' });
        });

        it('should select only selected fields (2 fields)', async () => {
            const transformer = new SelectFilter('foo,baz');
            const result = await transformer.run({ foo: 'bar', baz: 'qux', extra: 'nope' });
            expect(result).to.equal({ foo: 'bar', baz: 'qux' });
        });

        it('should not break with undefined fields', async () => {
            const transformer = new SelectFilter('foo,bar');
            const result = await transformer.run({ foo: 'bar', baz: 'qux', extra: 'nope' });
            expect(result).to.equal({ foo: 'bar' });
        });

        it('should include falsy values', async () => {
            const transformer = new SelectFilter('foo,baz');
            const result = await transformer.run({ foo: 0, baz: null, extra: 'nope' });
            expect(result).to.equal({ foo: 0, baz: null });
        });
    });

    describe('--exclude', () => {
        it('should error when strings weren\'t parsed into object', async () => {
            const transformer = new SelectFilter('foo', true);
            expect(transformer.run('a')).to.reject();
        });

        it('should exclude selected fields', async () => {
            const transformer = new SelectFilter('foo,baz', true);
            const result = await transformer.run({ foo: 'bar', baz: 'qux', extra: 'nope' });
            expect(result).to.equal({ extra: 'nope' });
        });

        it('should exclude unknown field', async () => {
            const transformer = new SelectFilter('extra', true);
            const result = await transformer.run({ foo: 'bar', baz: 'qux' });
            expect(result).to.equal({ foo: 'bar', baz: 'qux' });
        });

        it('should allow to exclude all fields', async () => {
            const transformer = new SelectFilter('foo,baz', true);
            const result = await transformer.run({ foo: 'bar', baz: 'qux' });
            expect(result).to.equal({});
        });

        it('should keep falsy values when not excluded', async () => {
            const transformer = new SelectFilter('foo', true);
            const result = await transformer.run({ foo: 0, baz: null, extra: 'nope' });
            expect(result).to.equal({ baz: null, extra: 'nope' });
        });
    });
});
