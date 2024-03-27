import { DomainValidationError } from '../../errors/domain-validation.error';
import { Rule } from './rule';

describe('Rule VO', () => {
  describe('eq', () => {
    it('should throw if eq is not a number', () => {
      let rule: Rule;
      try {
        rule = new Rule({ eq: 'test' } as any);
      } catch (error) {
        expect(error).toBeInstanceOf(DomainValidationError);
        expect(error.message).toContain('Eq must be a valid number');
      }

      expect(rule).toBeUndefined();
    });

    it('should not throw if eq is a number', () => {
      const rule = new Rule({ eq: 1 });
      expect(rule).toEqual({ eq: 1 });
    });

    it('should not allow usage of both eq and gt at the same time', () => {
      let rule: Rule;
      try {
        rule = new Rule({ eq: 'test', gt: 5 } as any);
      } catch (error) {
        expect(error).toBeDefined();
      }

      expect(rule).toBeUndefined();
    });

    it('should not allow usage of both eq and lt at the same time', () => {
      let rule: Rule;
      try {
        rule = new Rule({ eq: 'test', lt: 5 } as any);
      } catch (error) {
        expect(error).toBeInstanceOf(DomainValidationError);
        expect(error.message).toContain(
          'Cannot use eq and lt/gt at the same time',
        );
      }

      expect(rule).toBeUndefined();
    });
  });

  describe('gt', () => {
    it('should throw if gt is not a number', () => {
      let rule: Rule;
      try {
        rule = new Rule({ gt: 'test' } as any);
      } catch (error) {
        expect(error).toBeInstanceOf(DomainValidationError);
        expect(error.message).toContain('Gt must be a valid number');
      }

      expect(rule).toBeUndefined();
    });

    it('should not throw if gt is a number', () => {
      const rule = new Rule({ gt: 1 });
      expect(rule).toEqual({ gt: 1 });
    });
  });

  describe('lt', () => {
    it('should throw if lt is not a number', () => {
      let rule: Rule;
      try {
        rule = new Rule({ lt: 'test' } as any);
      } catch (error) {
        expect(error).toBeInstanceOf(DomainValidationError);
        expect(error.message).toContain('Lt must be a valid number');
      }

      expect(rule).toBeUndefined();
    });

    it('should not throw if lt is a number', () => {
      const rule = new Rule({ lt: 1 });
      expect(rule).toEqual({ lt: 1 });
    });
  });
});
