import { IsDateString } from 'class-validator';
import { Validator } from '../validator';
import { DomainValidationError } from '../../errors/domain-validation.error';

/**
 * A date rule is defined by a range of date to determine the span life of a promocode
 */
export class DateRule extends Validator<DateRule> {
  /**
   * If this attribute is defined then the promocode will be valid  only if it is used before the specified date
   */
  @IsDateString(
    {
      strict: true,
    },
    {
      message: 'Before must be a valid ISO 8601 date',
    },
  )
  before?: string;
  /**
   * If this attribute is defined then the promocode will be valid  only if it is used after the specified date
   */

  @IsDateString(
    {
      strict: true,
    },
    {
      message: 'After must be a valid ISO 8601 date',
    },
  )
  after?: string;

  /**
   * Throw if before date is set earlier than after date
   */
  protected validate(): void {
    super.validate();

    if (new Date(this.before) < new Date(this.after)) {
      throw new DomainValidationError(
        'Before date cannot be later than After date',
      );
    }
  }
}
