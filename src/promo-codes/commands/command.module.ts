import { Module } from '@nestjs/common';
import { CreatePromoCodeHandler } from './create-promo-code/create-promo-code.command';

@Module({
  imports: [],
  providers: [CreatePromoCodeHandler],
  exports: [CreatePromoCodeHandler],
})
export class CommandModule {}
