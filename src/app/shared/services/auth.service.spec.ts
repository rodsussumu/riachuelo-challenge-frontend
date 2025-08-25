import { TestBed } from '@angular/core/testing';
import { AuthService, UserRequest, UserLoginResponse, UserRegisterResponse } from './auth.service';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { environment } from '../../../environments/environment';
import { provideHttpClient } from '@angular/common/http';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/auth`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AuthService, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('deve ser criado', () => {
    expect(service).toBeTruthy();
  });

  describe('login', () => {
    it('deve fazer POST e retornar UserLoginResponse', () => {
      const mockRequest: UserRequest = { username: 'user', password: '123' };
      const mockResponse: UserLoginResponse = { authenticated: true, username: 'user' };

      service.login(mockRequest).subscribe((res) => {
        expect(res).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${apiUrl}/login`);
      expect(req.request.method).toBe('POST');
      expect(req.request.withCredentials).toBeTrue();
      req.flush(mockResponse);
    });
  });

  describe('register', () => {
    it('deve fazer POST e retornar UserRegisterResponse', () => {
      const mockRequest: UserRequest = { username: 'newUser', password: '123' };
      const mockResponse: UserRegisterResponse = { username: 'newUser', message: 'Registered!' };

      service.register(mockRequest).subscribe((res) => {
        expect(res).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${apiUrl}/register`);
      expect(req.request.method).toBe('POST');
      expect(req.request.withCredentials).toBeTrue();
      req.flush(mockResponse);
    });
  });

  describe('checkAuth', () => {
    it('deve retornar true quando /me responder com sucesso', () => {
      const mockResponse: UserLoginResponse = { authenticated: true, username: 'user' };

      service.checkAuth().subscribe((res) => {
        expect(res).toBeTrue();
      });

      const req = httpMock.expectOne(`${apiUrl}/me`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('deve retornar false quando /me der erro', () => {
      service.checkAuth().subscribe((res) => {
        expect(res).toBeFalse();
      });

      const req = httpMock.expectOne(`${apiUrl}/me`);
      req.flush('Erro', { status: 401, statusText: 'Unauthorized' });
    });
  });

  describe('logout', () => {
    it('deve chamar logout e limpar localStorage', () => {
      localStorage.setItem('username', 'user');

      service.logout().subscribe(() => {
        expect(localStorage.getItem('username')).toBeNull();
      });

      const req = httpMock.expectOne(`${apiUrl}/logout`);
      expect(req.request.method).toBe('POST');
      expect(req.request.withCredentials).toBeTrue();
      req.flush({});
    });
  });

  describe('localStorage handlers', () => {
    it('deve salvar e buscar username do localStorage', () => {
      service.setUsername('user');
      expect(service.getUsername()).toBe('user');
    });

    it('deve salvar string vazia quando username for null ou undefined', () => {
      service.setUsername(undefined as any);
      expect(localStorage.getItem('username')).toBe('');
    });

    it('deve retornar string vazia quando não houver username', () => {
      expect(service.getUsername()).toBe('');
    });

    it('deve limpar username do localStorage', () => {
      localStorage.setItem('username', 'user');
      service.clearUsername();
      expect(localStorage.getItem('username')).toBeNull();
    });

    it('deve ignorar erro ao tentar salvar no localStorage', () => {
      spyOn(localStorage, 'setItem').and.throwError('erro set');
      expect(() => service.setUsername('user')).not.toThrow();
    });

    it('deve ignorar erro ao tentar buscar no localStorage', () => {
      spyOn(localStorage, 'getItem').and.throwError('erro get');
      const result = service.getUsername();
      expect(result).toBe('');
    });

    it('deve ignorar erro ao tentar limpar no localStorage', () => {
      spyOn(localStorage, 'removeItem').and.throwError('erro remove');
      expect(() => service.clearUsername()).not.toThrow();
    });
  });
});
