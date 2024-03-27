jest.mock('ajv-errors');
jest.mock('ajv');
jest.mock('ajv-formats');

import { PromoCode } from '../../../promo-codes/domain/entities/promo-code.entity';
import { ValidatorService } from './validator.service';
import Ajv from 'ajv';
import { Restriction } from '../../../promo-codes/domain/entities/restriction';
import { DateRule } from '../../../promo-codes/domain/entities/rules/date-rule';
import { Advantage } from '../../../promo-codes/domain/entities/advantage';
import { Rule } from '../../../promo-codes/domain/entities/rules/rule';
import {
  Weather,
  WeatherRule,
} from '../../../promo-codes/domain/entities/rules/weather-rule';

describe('ValidatorService', () => {
  afterEach(() => jest.resetAllMocks());

  describe('execute', () => {
    it('should call ajv validate method with the schema generated from the promocode domain object', () => {
      const mockValidate = jest.fn();
      jest.spyOn(Ajv.prototype, 'compile').mockReturnValue(mockValidate as any);

      const service = new ValidatorService();

      const promoCode = new PromoCode({
        name: 'happy10',
        advantage: new Advantage({ percent: 10 }),
        restrictions: [
          new Restriction({
            date: new DateRule({
              after: '2021-03-20',
              before: '2050-04-22',
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

      const result = service.execute(promoCode, {});

      expect(Ajv.prototype.compile).toHaveBeenCalledWith({
        type: 'object',
        properties: {
          date: {
            errorMessage: {
              formatMaximum: 'The promoCode was valid until 2050-04-22',
              formatMinimum: 'The promoCode will be valid on 2021-03-20',
            },
            type: 'string',
            format: 'date',
            formatMinimum: '2021-03-20',
            formatMaximum: '2050-04-22',
          },
        },
        required: ['date'],
        anyOf: [
          {
            properties: {
              age: {
                errorMessage: {
                  maximum: 'age must not be greater than undefined',
                  minimum: 'age must not be lower than undefined',
                  const: 'age must be equal to 40',
                },
                type: 'number',
                const: 40,
              },
            },
            required: ['age'],
          },
          {
            allOf: [
              {
                properties: {
                  age: {
                    errorMessage: {
                      maximum: 'age must not be greater than 30',
                      minimum: 'age must not be lower than 15',
                      const: 'age must be equal to undefined',
                    },
                    type: 'number',
                    maximum: 30,
                    minimum: 15,
                  },
                },
                required: ['age'],
              },
              {
                properties: {
                  weather: {
                    type: 'object',
                    properties: {
                      is: {
                        type: 'string',
                        const: 'Ash',
                        errorMessage: {
                          const: 'The weather must be equal to Ash',
                        },
                      },
                      temp: {
                        errorMessage: {
                          maximum: 'temp must not be greater than undefined',
                          minimum: 'temp must not be lower than 15',
                        },
                        type: 'number',
                        minimum: 15,
                      },
                    },
                  },
                },
                required: ['weather'],
              },
            ],
          },
        ],
      });
      expect(mockValidate).toHaveBeenCalledWith({});
      expect(result.unwrap()).toBeTruthy();
    });

    it('should return an error if the validation has failed', () => {
      const mockValidate = jest.fn();

      (mockValidate as any).errors = ['oops', 'anyOf'];
      jest.spyOn(Ajv.prototype, 'compile').mockReturnValue(mockValidate as any);

      const service = new ValidatorService();

      const promoCode = new PromoCode({
        name: 'happy10',
        advantage: new Advantage({ percent: 10 }),
        restrictions: [
          new Restriction({
            date: new DateRule({
              after: '2021-03-20',
              before: '2050-04-22',
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

      const result = service.execute(promoCode, {});

      expect(Ajv.prototype.compile).toHaveBeenCalledWith({
        type: 'object',
        properties: {
          date: {
            errorMessage: {
              formatMaximum: 'The promoCode was valid until 2050-04-22',
              formatMinimum: 'The promoCode will be valid on 2021-03-20',
            },
            type: 'string',
            format: 'date',
            formatMinimum: '2021-03-20',
            formatMaximum: '2050-04-22',
          },
        },
        required: ['date'],
        anyOf: [
          {
            properties: {
              age: {
                errorMessage: {
                  maximum: 'age must not be greater than undefined',
                  minimum: 'age must not be lower than undefined',
                  const: 'age must be equal to 40',
                },
                type: 'number',
                const: 40,
              },
            },
            required: ['age'],
          },
          {
            allOf: [
              {
                properties: {
                  age: {
                    errorMessage: {
                      maximum: 'age must not be greater than 30',
                      minimum: 'age must not be lower than 15',
                      const: 'age must be equal to undefined',
                    },
                    type: 'number',
                    maximum: 30,
                    minimum: 15,
                  },
                },
                required: ['age'],
              },
              {
                properties: {
                  weather: {
                    type: 'object',
                    properties: {
                      is: {
                        type: 'string',
                        const: 'Ash',
                        errorMessage: {
                          const: 'The weather must be equal to Ash',
                        },
                      },
                      temp: {
                        errorMessage: {
                          maximum: 'temp must not be greater than undefined',
                          minimum: 'temp must not be lower than 15',
                        },
                        type: 'number',
                        minimum: 15,
                      },
                    },
                  },
                },
                required: ['weather'],
              },
            ],
          },
        ],
      });
      expect(mockValidate).toHaveBeenCalledWith({});
      expect(result.isErr).toBeTruthy();
      expect(() => result.unwrap()).toThrow();
    });
  });
});
