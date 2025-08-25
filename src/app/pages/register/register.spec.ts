import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Register } from './register';
import { AuthService } from '../../shared/services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('Register Page', () => {
  let fixture: ComponentFixture<Register>;
  let component: Register;

  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;
  let snackBarOpenSpy: jasmine.Spy<(message: string, action?: string, config?: any) => any>;

  beforeEach(async () => {
    const authSpy = jasmine.createSpyObj<AuthService>('AuthService', ['register']);
    const routerSpy = jasmine.createSpyObj<Router>('Router', ['navigateByUrl']);

    await TestBed.configureTestingModule({
      imports: [Register],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: authSpy },
        { provide: Router, useValue: routerSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Register);
    component = fixture.componentInstance;

    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;

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

    expect(authService.register).not.toHaveBeenCalled();
    expect(snackBarOpenSpy).not.toHaveBeenCalled();
    expect(component.loading).toBeFalse();
  }));

  it('submit should early return when already loading', fakeAsync(() => {
    component.loading = true;

    component.submit();
    tick();

    expect(authService.register).not.toHaveBeenCalled();
    expect(component.loading).toBeTrue();
  }));

  it('submit should register and navigate on success', fakeAsync(() => {
    component.form.setValue({ username: 'john', password: 'secret' });

    const mockRegisterResponse = { ok: true } as any;
    authService.register.and.returnValue(of(mockRegisterResponse));

    component.submit();
    tick();

    expect(authService.register).toHaveBeenCalledWith({ username: 'john', password: 'secret' });
    expect(snackBarOpenSpy).toHaveBeenCalledWith(
      'Cadastro realizado com sucesso!',
      'Fechar',
      jasmine.objectContaining({ duration: 3000 })
    );
    expect(component.loading).toBeFalse();
    expect(router.navigateByUrl).toHaveBeenCalledWith('/login');
  }));

  it('submit should show error snackbar on failure', fakeAsync(() => {
    component.form.setValue({ username: 'john', password: 'secret' });
    authService.register.and.returnValue(throwError(() => new Error('boom')));

    component.submit();
    tick();

    expect(authService.register).toHaveBeenCalled();
    expect(snackBarOpenSpy).toHaveBeenCalledWith(
      'Erro ao cadastrar usuário',
      'Fechar',
      jasmine.objectContaining({ duration: 3000 })
    );
    expect(component.loading).toBeFalse();
    expect(router.navigateByUrl).not.toHaveBeenCalled();
  }));

  it('goToLogin should navigate to /login', () => {
    component.goToLogin();
    expect(router.navigateByUrl).toHaveBeenCalledWith('/login');
  });
});
