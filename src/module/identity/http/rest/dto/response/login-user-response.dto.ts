export class LoginUserResponseDto {
  constructor(token: string) {
    this.token = token;
  }
  token: string;
}
