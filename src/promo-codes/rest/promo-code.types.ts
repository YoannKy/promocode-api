import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Weather } from '../domain/entities/rules/weather-rule';

export class RuleBody {
  @ApiPropertyOptional({
    description: 'Use this property if you want to declare a specify value',
    example: '5',
  })
  eq?: number;
  @ApiPropertyOptional({
    description: 'Use this property if you want to declare a maximum value',
    example: '15',
  })
  lt?: number;
  @ApiPropertyOptional({
    description: 'Use this property if you want to declare a minimum value',
    example: '10',
  })
  gt?: number;
}

export class WeatherBody {
  @ApiProperty({
    description: 'Use this property if you want to precise a weather condition',
    enum: Weather,
    example: Weather.ASH,
  })
  is: Weather;
  @ApiProperty({
    description: 'Use this property if you want to precise a temperature',
    example: { eq: 5 },
  })
  temp: RuleBody;
}

export class DateBody {
  @ApiPropertyOptional({
    description:
      'Use this property if you want to declare an end date for the promocode',
    example: '2024-10-31',
  })
  before?: string;
  @ApiPropertyOptional({
    description:
      'Use this property if you want to declare a start date for the promocode',
    example: '2024-10-25',
  })
  after?: string;
}

export class AdvantageBody {
  @ApiProperty({
    description: 'Declare the discount',
    example: 10,
  })
  percent: number;
}

export class PromoCodeBody {
  @ApiProperty({
    description: 'The name of the promocode',
    example: 'happy10',
  })
  public name: string;
  @ApiProperty({
    description:
      'The discount applied for the user once he has redeemed the promo code',
    example: { percent: 10 },
  })
  public advantage: AdvantageBody;
  @ApiPropertyOptional({
    description:
      'Use this property if you want to declare an age range/specific age restriction for the promocode',
    example: { eq: 5 },
  })
  public age?: RuleBody;
  @ApiPropertyOptional({
    description:
      'Use this property if you want to declare a date range restriction for the promocode',
    example: { before: '2024-10-31', after: '2024-10-25' },
  })
  public date?: DateBody;
  @ApiPropertyOptional({
    description:
      'Use this property if you want to declare a weather restriction for the promocode',
    example: { is: Weather.ASH, temp: { eq: 5 } },
  })
  public weather?: WeatherBody;
  @ApiPropertyOptional({
    description:
      'Use this property if you want to  declare a set of restrictions where at least one restriction must be matched',
    example: [
      { age: { eq: 40 } },
      {
        and: [
          { age: { lt: 30, gt: 15 } },
          { weather: { is: Weather.ASH, temp: { eq: 5 } } },
        ],
      },
    ],
  })
  public or?: RecursiveRestrictionBody[];
  @ApiPropertyOptional({
    description:
      'Use this property if you want to  declare a set of restrictions where all restrictions must be matched',
    example: [
      { age: { eq: 40 } },
      {
        or: [
          { date: { before: '2024-01-15' } },
          { weather: { is: Weather.ASH, temp: { eq: 5 } } },
        ],
      },
    ],
  })
  public and?: RecursiveRestrictionBody[];
}

export class RecursiveRestrictionBody {
  @ApiPropertyOptional({
    description:
      'Use this property if you want to declare an age range/specific age restriction for the promocode',
    example: { eq: 5 },
  })
  age?: PromoCodeBody['age'];
  @ApiPropertyOptional({
    description:
      'Use this property if you want to declare a date range restriction for the promocode',
    example: { before: '2024-10-31', after: '2024-10-25' },
  })
  date?: PromoCodeBody['date'];
  @ApiPropertyOptional({
    description:
      'Use this property if you want to declare a weather restriction for the promocode',
    example: { is: Weather.ASH, temp: { eq: 5 } },
  })
  weather?: PromoCodeBody['weather'];
  @ApiPropertyOptional({
    description:
      'Use this property if you want to  declare a set of restrictions where all restrictions must be matched',
    example: [
      { age: { eq: 40 } },
      {
        or: [
          { date: { before: '2024-01-15' } },
          { weather: { is: Weather.ASH, temp: { eq: 5 } } },
        ],
      },
    ],
  })
  and?: PromoCodeBody['and'];
  @ApiPropertyOptional({
    description:
      'Use this property if you want to  declare a set of restrictions where at least one restriction must be matched',
    example: [
      { age: { eq: 40 } },
      {
        and: [
          { age: { lt: 30, gt: 15 } },
          { weather: { is: Weather.ASH, temp: { eq: 5 } } },
        ],
      },
    ],
  })
  or?: PromoCodeBody['or'];
}

export class CheckParams {
  @ApiPropertyOptional({
    description: 'The age of the person requesting the promocode',
  })
  age?: number;

  @ApiPropertyOptional({
    description: 'The town of the person requesting the promocode',
  })
  town?: string;

  @ApiProperty({
    description: 'The name of the promocode',
  })
  name: string;
}
