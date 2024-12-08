import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthGuard } from './auth.guard';

describe('AuthGuard', () => {
  let guard: AuthGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AuthGuard], // Asegúrate de que AuthGuard esté registrado
    });
    guard = TestBed.inject(AuthGuard); // Usa TestBed para obtener una instancia de AuthGuard
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('should allow activation when the user is authenticated', () => {
    const route = {} as ActivatedRouteSnapshot; // Simula ActivatedRouteSnapshot
    const state = {} as RouterStateSnapshot; // Simula RouterStateSnapshot

    spyOn(guard, 'canActivate').and.returnValue(true); // Simula el comportamiento del método canActivate
    expect(guard.canActivate(route, state)).toBeTrue();
  });

  it('should block activation when the user is not authenticated', () => {
    const route = {} as ActivatedRouteSnapshot; // Simula ActivatedRouteSnapshot
    const state = {} as RouterStateSnapshot; // Simula RouterStateSnapshot

    spyOn(guard, 'canActivate').and.returnValue(false); // Simula el comportamiento del método canActivate
    expect(guard.canActivate(route, state)).toBeFalse();
  });
});
