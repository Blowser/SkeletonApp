import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
  Router,
} from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | UrlTree {
    const usuarioLogeado = localStorage.getItem('usuarioLogeado');

    if (usuarioLogeado) {
      const usuario = JSON.parse(usuarioLogeado);
      if (usuario.isLoggedIn) {
        return true; // Usuario logeado, permitir acceso
      }
    }

    // Redirigir al login si no está logeado
    console.warn('Acceso denegado. Redirigiendo al login...');
    return this.router.createUrlTree(['/ingresar']);
  }
}
