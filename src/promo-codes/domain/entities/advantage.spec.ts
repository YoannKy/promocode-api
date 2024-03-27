import { DomainValidationError } from '../errors/domain-validation.error';
import { Advantage } from './advantage';

describe('Advantage VO', () => {
  describe('percent', () => {
    it('should throw if eq is not a number', () => {
      let advantage: Advantage;
      try {
        advantage = new Advantage({ percent: 'test' } as any);
      } catch (error) {
        expect(error).toBeInstanceOf(DomainValidationError);
        expect(error.message).toContain('Percent must be a valid number');
      }

      expect(advantage).toBeUndefined();
    });
    it('should not throw if eq is a number', () => {
      const rule = new Advantage({ percent: 15 });
      expect(rule).toEqual({ percent: 15 });
    });
  });
});
