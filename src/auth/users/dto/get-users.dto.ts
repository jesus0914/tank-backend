// src/auth/users/dto/get-users.dto.ts
import { IsOptional, IsEnum } from 'class-validator';
import { UserRole } from '@prisma/client';

export class GetUsersDto {
  @IsOptional()
  @IsEnum(UserRole, { message: 'El rol debe ser USER o ADMIN' })
  role?: UserRole;
}
