import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class RolesGuard implements CanActivate {
  canActivate(_context: ExecutionContext): boolean {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const request = _context.switchToHttp().getRequest();
    console.log(request);
    return true;
  }
}
