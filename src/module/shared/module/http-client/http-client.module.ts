import { Module } from '@nestjs/common';
import { HttpClient } from './client/http.client';

@Module({
  imports: [],
  providers: [HttpClient],
  exports: [HttpClient],
})
export class HttpClientModule {}
