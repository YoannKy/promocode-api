import { DomainValidationError } from '../errors/domain-validation.error';
import { Advantage } from './advantage';
import { PromoCode } from './promo-code.entity';
import { Restriction } from './restriction';
import { DateRule } from './rules/date-rule';
import { Rule } from './rules/rule';
import { Weather, WeatherRule } from './rules/weather-rule';

describe('Promocode', () => {
  describe('name', () => {
    it('should throw if name is not a valid string', () => {
      let promoCode: PromoCode;
      try {
        promoCode = new PromoCode({ name: 50 } as any);
      } catch (error) {
        expect(error).toBeInstanceOf(DomainValidationError);
        expect(error.message).toContain('Name must be a valid string');
      }

      expect(promoCode).toBeUndefined();
    });
  });

  it('should not throw if the whole object is valid', () => {
    const promoCode = new PromoCode({
      name: 'test',
      advantage: new Advantage({ percent: 5 }),
      restrictions: [
        new Restriction({
          date: new DateRule({
            after: '2022-10-12',
            before: '2022-11-12',
          }),
        }),
        new Restriction({
          or: [
            new Restriction({
              age: new Rule({ eq: 40 }),
            }),
            new Restriction({
              and: [
                new Restriction({
                  age: new Rule({
                    lt: 30,
                    gt: 15,
                  }),
                }),
                new Restriction({
                  weather: new WeatherRule({
                    is: Weather.ASH,
                    temp: new Rule({ gt: 15 }),
                  }),
                }),
              ],
            }),
          ],
        }),
      ],
    });

    expect(promoCode).toEqual({
      name: 'test',
      advantage: new Advantage({ percent: 5 }),
      restrictions: [
        new Restriction({
          date: new DateRule({
            after: '2022-10-12',
            before: '2022-11-12',
          }),
        }),
        new Restriction({
          or: [
            new Restriction({
              age: new Rule({ eq: 40 }),
            }),
            new Restriction({
              and: [
                new Restriction({
                  age: new Rule({
                    lt: 30,
                    gt: 15,
                  }),
                }),
                new Restriction({
                  weather: new WeatherRule({
                    is: Weather.ASH,
                    temp: new Rule({ gt: 15 }),
                  }),
                }),
              ],
            }),
          ],
        }),
      ],
    });
  });
});
