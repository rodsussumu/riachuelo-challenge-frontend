import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppHeader } from './header';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

describe('AppHeader', () => {
  let fixture: ComponentFixture<AppHeader>;
  let component: AppHeader;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('AuthService', [
      'checkAuth',
      'clearUsername',
      'getUsername',
      'logout',
    ]);
    routerSpy = jasmine.createSpyObj('Router', ['navigateByUrl']);

    await TestBed.configureTestingModule({
      imports: [AppHeader],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    }).compileComponents();
  });

  function createComp() {
    fixture = TestBed.createComponent(AppHeader);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  it('should create', () => {
    authServiceSpy.checkAuth.and.returnValue(of(true));
    authServiceSpy.getUsername.and.returnValue('User');
    createComp();
    expect(component).toBeTruthy();
  });

  describe('constructor behavior', () => {
    it('should clear username and redirect when checkAuth returns false', () => {
      authServiceSpy.checkAuth.and.returnValue(of(false));
      createComp();
      expect(authServiceSpy.clearUsername).toHaveBeenCalled();
      expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/login');
    });

    it('should set username when checkAuth returns true', () => {
      authServiceSpy.checkAuth.and.returnValue(of(true));
      authServiceSpy.getUsername.and.returnValue('Alice');
      createComp();
      expect(component.username()).toBe('Alice');
      expect(component.initials()).toBe('A');
    });

    it('should clear username and redirect when checkAuth errors', () => {
      authServiceSpy.checkAuth.and.returnValue(throwError(() => new Error('fail')));
      createComp();
      expect(authServiceSpy.clearUsername).toHaveBeenCalled();
      expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/login');
    });
  });

  describe('computed properties', () => {
    it('should return empty initials when no username', () => {
      authServiceSpy.checkAuth.and.returnValue(of(true));
      authServiceSpy.getUsername.and.returnValue('');
      createComp();
      expect(component.initials()).toBe('');
    });
  });

  describe('methods', () => {
    beforeEach(() => {
      authServiceSpy.checkAuth.and.returnValue(of(true));
      authServiceSpy.getUsername.and.returnValue('User');
      createComp();
    });

    it('goTasks should navigate to /tasks', () => {
      component.goTasks();
      expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/tasks');
    });

    it('logout should navigate to /login on success', () => {
      authServiceSpy.logout.and.returnValue(of(void 0));
      component.logout();
      expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/login');
    });

    it('logout should navigate to /login on error', () => {
      authServiceSpy.logout.and.returnValue(throwError(() => new Error('fail')));
      component.logout();
      expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/login');
    });
  });
});
