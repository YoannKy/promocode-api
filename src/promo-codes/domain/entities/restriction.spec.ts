import { DomainValidationError } from '../errors/domain-validation.error';
import { Restriction } from './restriction';
import { DateRule } from './rules/date-rule';

describe('restriction vo', () => {
  it('should throw an error if the restriction does not have at least 1 rule', () => {
    let restriction: Restriction;
    try {
      restriction = new Restriction({} as any);
    } catch (error) {
      expect(error).toBeInstanceOf(DomainValidationError);
      expect(error.message).toContain(
        'A restriction must have at least one rule',
      );
    }

    expect(restriction).toBeUndefined();
  });
  it('should not throw if the restriction has at least one rule', () => {
    const restriction = new Restriction({
      date: new DateRule({
        after: '2021-10-12',
        before: '2021-11-09',
      }),
    });
    expect(restriction.date).toEqual({
      after: '2021-10-12',
      before: '2021-11-09',
    });
  });
});
