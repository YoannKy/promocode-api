import { IsNumber, ValidateIf } from 'class-validator';
import { Validator } from '../validator';
import { DomainValidationError } from '../../errors/domain-validation.error';

/**
 * A rule is bound to either a strictly equal value
 * ie "the value must be equal to 5"
 * or a range value
 * ie "the value must be between 5 and 10"
 */

export class Rule extends Validator<Rule> {
  /**
   * Stands for the lowest range possible for the value
   * ie "must be greater than 5"
   */
  @ValidateIf((rule: Rule) => rule.eq === undefined)
  @IsNumber(
    {},
    {
      message: 'Gt must be a valid number',
    },
  )
  @IsNumber()
  gt?: number;

  /**
   * Stands for the highest possible for the value
   * ie "must be lower than 5"
   */
  @ValidateIf((rule: Rule) => rule.eq === undefined)
  @IsNumber(
    {},
    {
      message: 'Lt must be a valid number',
    },
  )
  lt?: number;

  /**
   * Stands for the exact number for the value
   * ie "must be equal to 5"
   */
  @ValidateIf((rule: Rule) => {
    return rule.gt === undefined && rule.lt === undefined;
  })
  @IsNumber(
    {},
    {
      message: 'Eq must be a valid number',
    },
  )
  eq?: number;

  /**
   * Throw if eq is used alongside lt or gt
   */
  protected validate(): void {
    super.validate();

    if (this.eq && (this.lt || this.gt)) {
      throw new DomainValidationError(
        'Cannot use eq and lt/gt at the same time',
      );
    }
  }
}
