import { Restriction } from '../../domain/entities/restriction';
import { AjvRestriction } from './ajv-restriction';
import { DateRule } from '../../domain/entities/rules/date-rule';
import Ajv from 'ajv';
import ajvError from 'ajv-errors';
import addFormats from 'ajv-formats';
import { Rule } from '../../domain/entities/rules/rule';
import { Weather, WeatherRule } from '../../domain/entities/rules/weather-rule';

describe('[INT] AjvRestriction', () => {
  afterEach(() => jest.resetAllMocks());

  it('should convert a set of restrictions into an ajv valid schema', () => {
    const dateRestriction = new Restriction({
      date: new DateRule({
        after: '2022-09-12',
        before: '2022-12-12',
      }),
    });

    const orRestriction = new Restriction({
      or: [
        new Restriction({
          age: new Rule({
            eq: 40,
          }),
        }),
        new Restriction({
          and: [
            new Restriction({
              age: new Rule({
                gt: 15,
                lt: 30,
              }),
            }),
            new Restriction({
              weather: new WeatherRule({
                is: Weather.CLEAR,
                temp: new Rule({ gt: 15 }),
              }),
            }),
          ],
        }),
      ],
    });

    /**
     * json validation schema: the date must be between 2022-09-12 and 2022-12-12
     * then either one of the two cases:
     * - the user must be 40 years old
     * - the user is between 15 and 30 years old and the weather must be clear while the temperature
     * is greater than 15 degree celcius
     */
    const ajvRestriction = new AjvRestriction([dateRestriction, orRestriction]);

    const ajv = new Ajv({ allErrors: true });

    addFormats(ajv);
    ajvError(ajv);

    const validate = ajv.compile(ajvRestriction.schema);

    expect(validate).toBeDefined();

    // this payload should be valid
    const firstPayload = {
      date: '2022-10-10',
      age: 15,
      weather: { is: Weather.CLEAR, temp: 20 },
    };

    expect(validate(firstPayload)).toBeTruthy();
    expect(validate.errors).toBeNull();

    // this payload should not be valid because the user is neither 40 nor between 15 and 30 years old
    const secondPayload = {
      date: '2022-10-10',
      age: 50,
      weather: { is: Weather.CLEAR, temp: 20 },
    };
    expect(validate(secondPayload)).toBeFalsy();
    expect(validate.errors).toBeDefined();
  });
});
