import { Rule } from './rule';
import { Validator } from '../validator';
import { IsDefined, IsEnum, ValidateNested } from 'class-validator';

export enum Weather {
  THUNDERSTORM = 'Thunderstorm',
  DRIZZLE = 'Drizzle',
  RAIN = 'Rain',
  SNOW = 'Snow',
  MIST = 'Mist',
  SMOKE = 'Smoke',
  HAZE = 'Haze',
  DUST = 'Dust',
  FOG = 'Fog',
  SAND = 'Sand',
  ASH = 'Ash',
  SQUALL = 'Squall',
  TORNADO = 'Tornado',
  CLEAR = 'Clear',
  CLOUDS = 'Clouds',
}
/**
 * A weather rule is defined by the weather condition (ie "sunny") and a temperature (ie "temperature is 15 degree celcius")
 */
export class WeatherRule extends Validator<WeatherRule> {
  /**
   * A promocode can be restricted to the current temperature
   * it can either be a specific temperature
   * ie "the promocode is valid if the temperature is 15 degree celcius"
   * or a temperature range
   * ie "the promocode is valid if the temprature is between 15 and 20 degree celcius"
   */
  @ValidateNested({
    message: 'Temp must be a valid rule',
  })
  @IsDefined({
    message: 'Temp is required',
  })
  temp: Rule;
  /**
   *  Stands for the current weather condition (ie "sunny", "cloudy")
   */
  @IsEnum(Weather, {
    message: 'Is must be a valid enum',
  })
  @IsDefined({
    message: 'Is is required',
  })
  @IsDefined()
  is: Weather;
}
