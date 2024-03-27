import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PromoCode } from '../../domain/entities/promo-code.entity';
import { Restriction } from '../../domain/entities/restriction';
import { Rule } from '../../domain/entities/rules/rule';
import { DateRule } from '../../domain/entities/rules/date-rule';
import { WeatherRule } from '../../domain/entities/rules/weather-rule';
import { Advantage } from '../../domain/entities/advantage';
import { FakeDBService } from '../../infrastructure/fake-db/fake-db.service';
import { DomainValidationError } from '../../domain/errors/domain-validation.error';
import { Result } from '@badrap/result';
import { UnknownError } from '../../domain/errors/unknown.error';
import { Logger } from '@nestjs/common';

/**
 * Command to create a promoCode
 */
export class CreatePromoCodeCommand {
  constructor(
    public readonly name: PromoCode['name'],
    public readonly advantage: { percent: Advantage['percent'] },
    public readonly age?: { eq?: Rule['eq']; gt?: Rule['gt']; lt?: Rule['lt'] },
    public readonly date?: {
      before?: DateRule['before'];
      after?: DateRule['after'];
    },
    public readonly weather?: {
      is: WeatherRule['is'];
      temp: { eq?: Rule['eq']; gt?: Rule['gt']; lt?: Rule['lt'] };
    },
    public readonly and?: RecursiveRestriction[],
    public readonly or?: RecursiveRestriction[],
  ) {}
}

@CommandHandler(CreatePromoCodeCommand)
export class CreatePromoCodeHandler
  implements ICommandHandler<CreatePromoCodeCommand>
{
  protected logger: Logger = new Logger(CreatePromoCodeHandler.name);

  constructor(protected fakeDBService: FakeDBService) {}

  public async execute(
    command: CreatePromoCodeCommand,
  ): Promise<Result<PromoCode, UnknownError | DomainValidationError>> {
    this.logger.log('Proceeding to create a promocode', { command });

    const promoCodeInDB = await this.fakeDBService.findPromoCode(command?.name);

    if (promoCodeInDB) {
      return Result.err(
        new DomainValidationError('This promocode name already exist'),
      );
    }

    const restrictions: Restriction[] = [];
    let promoCode: PromoCode;
    try {
      if (command.age) {
        this.logger.debug(
          'Proceeding to apply age restriction on the promocode',
          { command },
        );
        restrictions.push(
          new Restriction({
            age: new Rule(command.age),
          }),
        );
      }

      if (command.date) {
        this.logger.debug(
          'Proceeding to apply date restriction on the promocode',
          { command },
        );
        restrictions.push(
          new Restriction({
            date: new DateRule(command.date),
          }),
        );
      }

      if (command.weather) {
        this.logger.debug(
          'Proceeding to apply weather restriction on the promocode',
          { command },
        );
        restrictions.push(
          new Restriction({
            weather: new WeatherRule({
              is: command.weather.is,
              temp: new Rule(command.weather.temp),
            }),
          }),
        );
      }

      if (command.and?.length) {
        this.logger.debug(
          'Proceeding to apply and restriction on the promocode',
          { command },
        );
        restrictions.push(
          new Restriction({
            and: this.setRecursiveOperators(command.and),
          }),
        );
      }

      if (command.or?.length) {
        this.logger.debug(
          'Proceeding to apply or restriction on the promocode',
          { command },
        );
        restrictions.push(
          new Restriction({
            or: this.setRecursiveOperators(command.or),
          }),
        );
      }

      this.logger.debug('Proceeding to create the promocode', {
        command,
        restrictions,
      });

      promoCode = new PromoCode({
        name: command.name,
        advantage: new Advantage(command.advantage),
        restrictions,
      });
    } catch (error) {
      this.logger.error('Could not create the promocode', {
        command,
        error: { message: error.message, stack: error.stack },
      });
      if (error instanceof DomainValidationError) {
        return Result.err(error);
      }

      return Result.err(new UnknownError());
    }

    this.logger.debug('Inserting the promocode into db', { promoCode });

    this.fakeDBService.addPromoCode(promoCode);

    this.logger.log('Successfully created the promocode', { promoCode });

    return Result.ok(promoCode);
  }

  /**
   * format the incoming payload into a sub domain object (ie age, weather)
   * if the sub domain object is an operator (ie or/and) then a recursive format is done
   * @param operators an Or or And operator
   */
  protected setRecursiveOperators(
    operators:
      | CreatePromoCodeCommand['and']
      | CreatePromoCodeCommand['or'] = [],
  ): Restriction[] {
    return operators.reduce((operatorAcc: Restriction[], operator) => {
      if (operator.and?.length) {
        operatorAcc.push(
          new Restriction({
            and: this.setRecursiveOperators(operator.and),
          }),
        );
      }
      if (operator.or?.length) {
        operatorAcc.push(
          new Restriction({
            or: this.setRecursiveOperators(operator.or),
          }),
        );
      }

      if (operator.age) {
        operatorAcc.push(
          new Restriction({
            age: new Rule(operator.age),
          }),
        );
      }

      if (operator.date) {
        operatorAcc.push(
          new Restriction({
            date: new DateRule({
              after: operator.date.after,
              before: operator.date.before,
            }),
          }),
        );
      }

      if (operator.weather) {
        operatorAcc.push(
          new Restriction({
            weather: new WeatherRule({
              is: operator.weather.is,
              temp: new Rule(operator.weather.temp),
            }),
          }),
        );
      }
      return operatorAcc;
    }, []);
  }
}

export type RecursiveRestriction = { age?: CreatePromoCodeCommand['age'] } & {
  date?: CreatePromoCodeCommand['date'];
} & { weather?: CreatePromoCodeCommand['weather'] } & {
  and?: CreatePromoCodeCommand['and'];
} & { or?: CreatePromoCodeCommand['or'] };
