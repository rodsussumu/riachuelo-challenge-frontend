import { HttpRequest } from '@angular/common/http';
import { authInterceptor } from './auth.interceptor';

describe('authInterceptor', () => {
  it('deve adicionar withCredentials=true em todas as requests', () => {
    const req = new HttpRequest('GET', '/test');
    const next = jasmine.createSpy().and.callFake((newReq: HttpRequest<any>) => {
      expect(newReq.withCredentials).toBeTrue();
      return 'mockResponse' as any;
    });

    const result = authInterceptor(req, next);

    expect(next).toHaveBeenCalled();
    expect(result).toBe('mockResponse' as any);
  });
});
