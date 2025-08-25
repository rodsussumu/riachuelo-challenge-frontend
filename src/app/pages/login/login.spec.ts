import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Login } from './login';
import { AuthService } from '../../shared/services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('Login Page', () => {
  let fixture: ComponentFixture<Login>;
  let component: Login;

  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;
  let snackBarOpenSpy: jasmine.Spy<(message: string, action?: string, config?: any) => any>;

  beforeEach(async () => {
    const authSpy = jasmine.createSpyObj<AuthService>('AuthService', ['login', 'setUsername']);
    const routerSpy = jasmine.createSpyObj<Router>('Router', ['navigateByUrl']);

    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: authSpy },
        { provide: Router, useValue: routerSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;

    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    // Spy the exact MatSnackBar instance used by the component
    snackBarOpenSpy = spyOn((component as any).snackBar as MatSnackBar, 'open');

    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('form should be invalid initially', () => {
    expect(component.form.valid).toBeFalse();
  });

  it('submit should early return when form is invalid', fakeAsync(() => {
    component.submit();
    tick();

    expect(authService.login).not.toHaveBeenCalled();
    expect(snackBarOpenSpy).not.toHaveBeenCalled();
    expect(component.loading).toBeFalse();
  }));

  it('submit should early return when already loading', fakeAsync(() => {
    component.loading = true;

    component.submit();
    tick();

    expect(authService.login).not.toHaveBeenCalled();
    expect(component.loading).toBeTrue();
  }));

  it('submit should login, set username and navigate on success', fakeAsync(() => {
    component.form.setValue({ username: 'john', password: 'secret' });

    const mockResponse = { username: 'john' } as any;
    authService.login.and.returnValue(of(mockResponse));

    component.submit();
    tick();

    expect(authService.login).toHaveBeenCalledWith({ username: 'john', password: 'secret' });
    expect(authService.setUsername).toHaveBeenCalledWith('john');
    expect(snackBarOpenSpy).toHaveBeenCalledWith(
      'Login realizado com sucesso!',
      'Fechar',
      jasmine.objectContaining({ duration: 3000 })
    );
    expect(router.navigateByUrl).toHaveBeenCalledWith('/tasks');
    expect(component.loading).toBeFalse();
  }));

  it('submit should show error snackbar on failure', fakeAsync(() => {
    component.form.setValue({ username: 'john', password: 'secret' });
    authService.login.and.returnValue(throwError(() => new Error('invalid')));

    component.submit();
    tick();

    expect(authService.login).toHaveBeenCalled();
    expect(snackBarOpenSpy).toHaveBeenCalledWith(
      'Usuário ou senha inválido',
      'Fechar',
      jasmine.objectContaining({ duration: 3000 })
    );
    expect(authService.setUsername).not.toHaveBeenCalled();
    expect(router.navigateByUrl).not.toHaveBeenCalled();
    expect(component.loading).toBeFalse();
  }));

  it('goToRegister should navigate to /register', () => {
    component.goToRegister();
    expect(router.navigateByUrl).toHaveBeenCalledWith('/register');
  });

  it('submit should fallback to form username when response has no username', fakeAsync(() => {
    component.form.setValue({ username: 'jane', password: '123' });
    authService.login.and.returnValue(of({} as any));

    component.submit();
    tick();

    expect(authService.login).toHaveBeenCalledWith({ username: 'jane', password: '123' });
    expect(authService.setUsername).toHaveBeenCalledWith('jane'); // <- cobre o fallback
    expect(snackBarOpenSpy).toHaveBeenCalledWith(
      'Login realizado com sucesso!',
      'Fechar',
      jasmine.objectContaining({ duration: 3000 })
    );
    expect(router.navigateByUrl).toHaveBeenCalledWith('/tasks');
    expect(component.loading).toBeFalse();
  }));
});
