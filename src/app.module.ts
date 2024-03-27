import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PromoCodeModule } from './promo-codes/promo-code.module';

@Module({
  imports: [CqrsModule.forRoot(), PromoCodeModule],
})
export class AppModule {}
