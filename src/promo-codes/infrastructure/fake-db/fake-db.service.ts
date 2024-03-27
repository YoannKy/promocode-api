import { Injectable } from '@nestjs/common';
import { PromoCode } from '../../domain/entities/promo-code.entity';
import { Restriction } from '../../domain/entities/restriction';
import { Advantage } from '../../domain/entities/advantage';
import { DateRule } from '../../domain/entities/rules/date-rule';
import { Rule } from '../../domain/entities/rules/rule';
import { Weather, WeatherRule } from '../../domain/entities/rules/weather-rule';


/**
 * Simulate DB 
 */
@Injectable()
export class FakeDBService {
  protected promoCodes: PromoCode[] = [
    new PromoCode({
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
    }),
  ];

  /**
   * Find a promocode based on a name
   */
  public findPromoCode(name?: string) {
    return this.promoCodes.find((promoCode) => promoCode.name === name);
  }

  public addPromoCode(promoCode: PromoCode) {
    this.promoCodes.push(promoCode);
  }
}
