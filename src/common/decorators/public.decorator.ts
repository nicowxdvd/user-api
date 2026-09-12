import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/** Marca una ruta como pública para que AuthGuard no exija token. */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
