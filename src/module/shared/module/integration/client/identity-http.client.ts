import { Injectable } from '@nestjs/common';
import { ConfigService } from '@src/module/shared/module/config/service/config.service';
import { HttpClient } from '../../http-client/client/http.client';
import { IdentityUserExistsApi } from '../interface/identity-integration.interface';
import { IdentityApiUserExistsResponseDto } from '../http/dto/identity-api-user-exists-response.dto';

@Injectable()
export class IdentityHttpClient implements IdentityUserExistsApi {
  constructor(
    private readonly httpClient: HttpClient,
    private readonly configService: ConfigService
  ) {}
  async userExists(userId: string): Promise<boolean> {
    const options = {
      method: 'GET',
      headers: {
        accept: 'application/json',
        //Authorization: `Bearer PUT SOMETHING`,
      },
    };
    const url = `${this.configService.get('identityApi.url')}/identity/user/exists/${userId}`;

    const response = await this.httpClient.get<IdentityApiUserExistsResponseDto>(
      url,
      options
    );

    return response.exists;
  }
}
