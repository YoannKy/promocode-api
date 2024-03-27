import { Restriction } from '../../domain/entities/restriction';

/**
 * This DTO will convert the restriction domain object into an AJV schema
 */
export class AjvRestriction {
  public schema: any;

  constructor(restrictions: Restriction[]) {
    const properties = restrictions.reduce(
      (restrictionAcc, restriction) => {
        const age = this.convertAgeRestriction(restriction.age);
        const date = this.convertDateRestriction(restriction.date);
        const weather = this.convertWeatherRestriction(restriction.weather);
        const and = this.convertAndRestriction(restriction.and);
        const or = this.convertOrRestriction(restriction.or);

        restrictionAcc.properties = {
          ...restrictionAcc.properties,
          ...age,
          ...date,
          ...weather,
        };

        restrictionAcc = {
          ...restrictionAcc,
          ...and,
          ...or,
        };

        if (Object.keys(age).length) {
          restrictionAcc.required.push('age');
        } else if (Object.keys(date).length) {
          restrictionAcc.required.push('date');
        } else if (Object.keys(weather).length) {
          restrictionAcc.required.push('weather');
        }

        return restrictionAcc;
      },
      {
        properties: {},
        required: [],
      },
    );

    this.schema = {
      type: 'object',
      ...properties,
    };

    Object.freeze(this.schema);
  }

  /**
   * Convert the age restriction into an AJV sub schema
   */
  protected convertAgeRestriction(ageRestriction: Restriction['age']) {
    if (!ageRestriction) {
      return {};
    }
    return {
      age: {
        errorMessage: {
          maximum: `age must not be greater than ${ageRestriction.lt}`,
          minimum: `age must not be lower than ${ageRestriction.gt}`,
          const: `age must be equal to ${ageRestriction.eq}`,
        },
        type: 'number',
        const: ageRestriction.eq,
        maximum: ageRestriction.lt,
        minimum: ageRestriction.gt,
      },
    };
  }

  protected convertDateRestriction(dateRestriction: Restriction['date']) {
    if (!dateRestriction) {
      return {};
    }
    return {
      date: {
        errorMessage: {
          formatMaximum: `The promoCode was valid until ${dateRestriction.before}`,
          formatMinimum: `The promoCode will be valid on ${dateRestriction.after}`,
        },
        type: 'string',
        format: 'date',
        formatMinimum: dateRestriction.after,
        formatMaximum: dateRestriction.before,
      },
    };
  }

  /**
   * Convert the weather restriction into an AJV sub schema
   */
  protected convertWeatherRestriction(
    weatherRestriction: Restriction['weather'],
  ) {
    if (!weatherRestriction) {
      return {};
    }
    return {
      weather: {
        type: 'object',
        properties: {
          is: {
            type: 'string',
            const: weatherRestriction.is,
            errorMessage: {
              const: `The weather must be equal to ${weatherRestriction.is}`,
            },
          },
          temp: {
            errorMessage: {
              maximum: `temp must not be greater than ${weatherRestriction.temp.eq ? weatherRestriction.temp.eq : weatherRestriction.temp.lt}`,
              minimum: `temp must not be lower than ${weatherRestriction.temp.eq ? weatherRestriction.temp.eq : weatherRestriction.temp.gt}`,
            },
            type: 'number',
            maximum: weatherRestriction.temp.eq
              ? weatherRestriction.temp.eq
              : weatherRestriction.temp.lt,
            minimum: weatherRestriction.temp.eq
              ? weatherRestriction.temp.eq
              : weatherRestriction.temp.gt,
          },
        },
      },
    };
  }

  /**
   * Convert the and restriction into an AJV sub schema
   */
  protected convertAndRestriction(andRestrition: Restriction['and']) {
    if (!andRestrition?.length) {
      return {};
    }
    return andRestrition.reduce(
      (andAcc, restriction, index) => {
        const age = this.convertAgeRestriction(restriction.age);
        const date = this.convertDateRestriction(restriction.date);
        const weather = this.convertWeatherRestriction(restriction.weather);
        const and = this.convertAndRestriction(restriction.and);
        const or = this.convertOrRestriction(restriction.or);

        const subSchema =
          Object.keys(age).length ||
          Object.keys(weather).length ||
          Object.keys(date).length
            ? {
                properties: {
                  ...age,
                  ...date,
                  ...weather,
                },
                ...and,
                ...or,
              }
            : { ...and, ...or };

        andAcc.allOf.push(subSchema);

        if (Object.keys(age).length) {
          andAcc.allOf[index].required = ['age'];
        } else if (Object.keys(date).length) {
          andAcc.allOf[index].required = ['date'];
        } else if (Object.keys(weather).length) {
          andAcc.allOf[index].required = ['weather'];
        }

        return andAcc;
      },
      {
        allOf: [],
      },
    );
  }

  /**
   * Convert the or restriction into an AJV sub schema
   */
  protected convertOrRestriction(orRestriction: Restriction['or']) {
    if (!orRestriction?.length) {
      return {};
    }
    return orRestriction.reduce(
      (orAcc, restriction, index) => {
        const age = this.convertAgeRestriction(restriction.age);
        const date = this.convertDateRestriction(restriction.date);
        const weather = this.convertWeatherRestriction(restriction.weather);
        const and = this.convertAndRestriction(restriction.and);
        const or = this.convertOrRestriction(restriction.or);
        const subSchema =
          Object.keys(age).length ||
          Object.keys(weather).length ||
          Object.keys(date).length
            ? {
                properties: {
                  ...age,
                  ...date,
                  ...weather,
                },
                ...and,
                ...or,
              }
            : { ...and, ...or };

        orAcc.anyOf.push(subSchema);

        if (Object.keys(age).length) {
          orAcc.anyOf[index].required = ['age'];
        } else if (Object.keys(date).length) {
          orAcc.anyOf[index].required = ['date'];
        } else if (Object.keys(weather).length) {
          orAcc.anyOf[index].required = ['weather'];
        }

        return orAcc;
      },
      {
        anyOf: [],
      },
    );
  }
}
