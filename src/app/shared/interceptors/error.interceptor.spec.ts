import { HttpRequest } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { errorInterceptor } from './error.interceptor';
import { Router } from '@angular/router';
import { TestBed } from '@angular/core/testing';

describe('errorInterceptor', () => {
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    TestBed.configureTestingModule({
      providers: [{ provide: Router, useValue: routerSpy }],
    });
  });

  it('deve redirecionar para /login em erro 401', (done) => {
    const req = new HttpRequest('GET', '/test');
    const next = jasmine.createSpy().and.returnValue(throwError(() => ({ status: 401 })));

    TestBed.runInInjectionContext(() => {
      errorInterceptor(req, next).subscribe({
        error: () => {
          expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
          done();
        },
      });
    });
  });

  it('não deve redirecionar para outros erros', (done) => {
    const req = new HttpRequest('GET', '/test');
    const next = jasmine.createSpy().and.returnValue(throwError(() => ({ status: 500 })));

    TestBed.runInInjectionContext(() => {
      errorInterceptor(req, next).subscribe({
        error: () => {
          expect(routerSpy.navigate).not.toHaveBeenCalled();
          done();
        },
      });
    });
  });
});
