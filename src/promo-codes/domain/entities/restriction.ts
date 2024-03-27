import { ValidateNested } from 'class-validator';
import { DateRule } from './rules/date-rule';
import { Rule } from './rules/rule';
import { WeatherRule } from './rules/weather-rule';
import { Validator } from './validator';
import { DomainValidationError } from '../errors/domain-validation.error';

/**
 * To narrow the usage of the promocode, a set of restrictions can be applied
 * which means that it is possible to use the promocode if the condtions specified within the restrictions are met
 * A restriction is defined by:
 * - an age
 * - a date
 * - a weather
 * - a set of restrictions where at least one of the restriction is met
 * - a set of restrictions where all the restrictions must be met
 */
export class Restriction extends Validator<Restriction> {
  /**
   * A promocode can be restricted to either an age range
   * ie "only users that are between 50 and 60 can use this promocode"
   * or a specific age
   * ie "only suers that are 25 years old can use this promocode"
   */
  @ValidateNested()
  public age?: Rule;

  /**
   * A promocode can be valid for a specific date range
   * ie "the promocode is valid between 01/10/2024 and 01/11/2024"
   */

  @ValidateNested()
  public date?: DateRule;

  /**
   * A promocode can only be valid if the current weather is equal to the conditions specificed by the promocode itself
   * ie "the promocode is only valid if it's sunny and the temperature is 15 degree celcius"
   */

  @ValidateNested()
  public weather?: WeatherRule;

  /**
   * A promocode can be applied with the combinations of multiples restrictions, in this case the or restriction
   * means that if at least one of the conditions specified whithin it is met then the promocode is valid
   * ie "the promocode is valid if the user is either aged between 20 and 25 or if the weather is cloudy"
   */

  @ValidateNested()
  public or?: Restriction[];

  /**
   * A promocode can be applied with the combinations of multiples restrictions, in this case the and restriction
   * means that if all the conditions specified whithin it are met then the promocode is valid
   * ie "the promocode is valid if the user is  aged between 20 and 25 and if the weather is cloudy"
   */

  @ValidateNested()
  public and?: Restriction[];

  /**
   * Throw if there is no restriction provided
   */
  protected validate(): void {
    super.validate();

    if (
      this.age === undefined &&
      this.and === undefined &&
      this.or === undefined &&
      this.weather === undefined &&
      this.date === undefined
    ) {
      throw new DomainValidationError(
        'A restriction must have at least one rule',
      );
    }
  }
}
