import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { of, throwError, Observable } from 'rxjs';
import { authGuard } from './guard.interceptor';
import { AuthService } from '../services/auth.service';

describe('authGuard', () => {
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let route: ActivatedRouteSnapshot;
  let state: RouterStateSnapshot;

  beforeEach(() => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['checkAuth']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    });

    route = {} as ActivatedRouteSnapshot;
    state = { url: '/test' } as RouterStateSnapshot;
  });

  it('deve retornar true quando usuário está autenticado', (done) => {
    authServiceSpy.checkAuth.and.returnValue(of(true));

    TestBed.runInInjectionContext(() => {
      (authGuard(route, state) as Observable<boolean>).subscribe((result) => {
        expect(result).toBeTrue();
        expect(routerSpy.navigate).not.toHaveBeenCalled();
        done();
      });
    });
  });

  it('deve redirecionar para /login e retornar false quando usuário não está autenticado', (done) => {
    authServiceSpy.checkAuth.and.returnValue(of(false));

    TestBed.runInInjectionContext(() => {
      (authGuard(route, state) as Observable<boolean>).subscribe((result) => {
        expect(result).toBeFalse();
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
        done();
      });
    });
  });

  it('deve redirecionar para /login e retornar false quando checkAuth falhar', (done) => {
    authServiceSpy.checkAuth.and.returnValue(throwError(() => new Error('fail')));

    TestBed.runInInjectionContext(() => {
      (authGuard(route, state) as Observable<boolean>).subscribe((result) => {
        expect(result).toBeFalse();
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
        done();
      });
    });
  });
});
