import { DomainValidationError } from '../../errors/domain-validation.error';
import { DateRule } from './date-rule';

describe('DateRule VO', () => {
  describe('before', () => {
    it('should throw if before is not a valid date', () => {
      let dateRule: DateRule;
      try {
        dateRule = new DateRule({ before: 'test' } as any);
      } catch (error) {
        expect(error).toBeInstanceOf(DomainValidationError);
        expect(error.message).toContain('Before must be a valid ISO 8601 date');
      }

      expect(dateRule).toBeUndefined();
    });

    it('should not throw if before is a date', () => {
      const dateRule = new DateRule({ before: '2021-12-10' });
      expect(dateRule).toEqual({
        before: '2021-12-10',
      });
    });
  });

  describe('after', () => {
    it('should throw if after is not a valid date', () => {
      let dateRule: DateRule;
      try {
        dateRule = new DateRule({ after: 'test' } as any);
      } catch (error) {
        expect(error).toBeInstanceOf(DomainValidationError);
        expect(error.message).toContain('After must be a valid ISO 8601 date');
      }

      expect(dateRule).toBeUndefined();
    });

    it('should not throw if after is a date', () => {
      const dateRule = new DateRule({ after: '2021-12-10' });
      expect(dateRule).toEqual({ after: '2021-12-10' });
    });
  });

  describe('before and after combination', () => {
    it('should throw if before date is set later than before date', () => {
      let dateRule: DateRule;
      try {
        dateRule = new DateRule({ after: '2024-12-18', before: '2020-12-15' });
      } catch (error) {
        expect(error).toBeInstanceOf(DomainValidationError);
        expect(error.message).toContain(
          'Before date cannot be later than After date',
        );
      }
      expect(dateRule).toBeUndefined();
    });
  });
});
