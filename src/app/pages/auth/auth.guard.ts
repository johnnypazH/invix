import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.getToken()) {
    return true; // Se tem token, pode entrar nas páginas!
  } else {
    router.navigate(['/auth/login']); // Se não, vai direto pro login
    return false;
  }
};