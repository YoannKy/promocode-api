import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Query,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreatePromoCodeCommand } from '../commands/create-promo-code/create-promo-code.command';
import { CheckParams, PromoCodeBody } from './promo-code.types';
import {
  AcceptedResult,
  CheckPromoCodeQuery,
  DeniedResult,
  Status,
} from '../queries/check-promo-code/check-promo-code.query';
import { Result } from '@badrap/result';
import { ApiResponse } from '@nestjs/swagger';
import { UnknownError } from '../domain/errors/unknown.error';
import { DomainValidationError } from '../domain/errors/domain-validation.error';
import { PromoCode } from 'src/promo-codes/domain/entities/promo-code.entity';

@Controller('promo-codes')
export class PromoCodeController {
  constructor(
    protected commandBus: CommandBus,
    protected queryBus: QueryBus,
  ) {}

  @Post()
  @ApiResponse({ status: 400, description: 'Bad params provided' })
  @ApiResponse({ status: 500, description: 'Server error' })
  @ApiResponse({ status: 200, description: 'OK response' })
  public async create(@Body() payload: PromoCodeBody) {
    const result = await this.commandBus.execute<
      CreatePromoCodeCommand,
      Result<PromoCode, UnknownError | DomainValidationError>
    >(
      new CreatePromoCodeCommand(
        payload?.name,
        payload?.advantage,
        payload?.age,
        payload?.date,
        payload?.weather,
        payload?.and,
        payload?.or,
      ),
    );

    if (result.isErr) {
      if (result.error instanceof DomainValidationError) {
        throw new HttpException(result.error.message, HttpStatus.BAD_REQUEST);
      }

      throw new HttpException(
        result.error.message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return result.unwrap();
  }

  @Get('check')
  @ApiResponse({ status: 400, description: 'Bad params provided' })
  @ApiResponse({ status: 500, description: 'Server error' })
  @ApiResponse({ status: 200, description: 'OK response' })
  public async checkValidity(@Query() payload: CheckParams) {
    const result = await this.queryBus.execute<
      CheckPromoCodeQuery,
      Result<AcceptedResult | DeniedResult, UnknownError>
    >(new CheckPromoCodeQuery(payload.name, Number(payload.age), payload.town));

    if (result.isErr) {
      return {
        name: payload.name,
        status: Status.DENIED,
        reasons: result.error.message,
      };
    }

    const data = result.unwrap();
    if (data.status === Status.ACCEPTED) {
      return {
        name: data.name,
        status: data.status,
        advantage: (data as AcceptedResult).advantage,
      };
    }
    return {
      name: data.name,
      status: data.status,
      reasons: (data as DeniedResult).reasons,
    };
  }
}
