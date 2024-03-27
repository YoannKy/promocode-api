import { Module } from '@nestjs/common';
import { RestModule } from './rest/rest.module';
import { FakeDBModule } from './infrastructure/fake-db/fake-db.module';
import { WeatherApiModule } from './infrastructure/weather-api/weather-api.module';

@Module({
  imports: [RestModule, FakeDBModule, WeatherApiModule],
})
export class PromoCodeModule {}
