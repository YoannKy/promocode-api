import { Module } from '@nestjs/common';
import { CheckPromoCodeHandler } from './check-promo-code/check-promo-code.query';
import { WeatherApiModule } from '../infrastructure/weather-api/weather-api.module';
import { AjvModule } from '../infrastructure/ajv/ajv.module';

@Module({
  imports: [WeatherApiModule, AjvModule],
  providers: [CheckPromoCodeHandler],
})
export class QueryModule {}
