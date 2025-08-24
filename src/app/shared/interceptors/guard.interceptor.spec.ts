import { TestBed } from '@angular/core/testing';

import { GuardInterceptor } from './guard.interceptor';

describe('GuardInterceptor', () => {
  let service: GuardInterceptor;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GuardInterceptor);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
