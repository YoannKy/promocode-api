import { DomainValidationError } from '../../errors/domain-validation.error';
import { Rule } from './rule';
import { Weather, WeatherRule } from './weather-rule';

describe('WeatherRule VO', () => {
  it('should validate if the whole object is valid', () => {
    const rule = new WeatherRule({
      temp: new Rule({ eq: 50 }),
      is: Weather.ASH,
    });
    expect(rule).toEqual({
      temp: new Rule({ eq: 50 }),
      is: Weather.ASH,
    });
  });
  describe('is', () => {
    it('should throw if "is" is not a valid enum', () => {
      let rule: WeatherRule;
      try {
        rule = new WeatherRule({ is: 'test' } as any);
      } catch (error) {
        expect(error).toBeInstanceOf(DomainValidationError);
        expect(error.message).toContain('Is must be a valid enum');
      }

      expect(rule).toBeUndefined();
    });
  });

  describe('temp', () => {
    it('should throw if "temp" is not a valid rule', () => {
      let rule: WeatherRule;
      try {
        rule = new WeatherRule({ temp: '50' } as any);
      } catch (error) {
        expect(error).toBeInstanceOf(DomainValidationError);
        expect(error.message).toContain('Temp must be a valid rule');
      }
      expect(rule).toBeUndefined();
    });
  });
});
