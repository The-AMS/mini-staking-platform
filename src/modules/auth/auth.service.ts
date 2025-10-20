import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  register() {
    return 'This action adds a new auth';
  }

  login() {
    return `This action returns a login auth`;
  }

  logout() {
    return 'This action removes a login auth';
  }
}
