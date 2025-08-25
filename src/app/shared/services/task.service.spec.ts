import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { TaskService } from './task.service';
import { environment } from '../../environments/environment';
import { Task, TaskRequest, StatusUpdateRequest } from '../interfaces/task.interface';
import { StatusEnum } from '../enums/status.enum';

describe('TaskService', () => {
  let service: TaskService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/tasks`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TaskService, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(TaskService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('create', () => {
    it('should POST a new task', () => {
      const mockTask: TaskRequest = { description: 'New task', dueDate: new Date() };
      const mockResponse: Task = { id: 1, ...mockTask, status: 'PENDING' } as any;

      service.create(mockTask).subscribe((res) => {
        expect(res).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockTask);
      req.flush(mockResponse);
    });
  });

  describe('list', () => {
    it('should GET all tasks without params', () => {
      const mockResponse: Task[] = [
        { id: 1, description: 'Test', dueDate: new Date(), status: 'PENDING' } as any,
      ];

      service.list().subscribe((res) => {
        expect(res).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(
        (r) => r.url === apiUrl && !r.params.has('status') && !r.params.has('sort')
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should GET tasks with status and sort params', () => {
      const mockResponse: Task[] = [
        { id: 2, description: 'Sorted', dueDate: new Date(), status: 'DONE' } as any,
      ];

      service.list('DONE', 'desc').subscribe((res) => {
        expect(res).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(
        (r) =>
          r.url === apiUrl && r.params.get('status') === 'DONE' && r.params.get('sort') === 'desc'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('listById', () => {
    it('should GET a task by ID', () => {
      const mockResponse: Task = {
        id: 10,
        description: 'ById',
        dueDate: new Date(),
        status: 'PENDING',
      } as any;

      service.listById(10).subscribe((res) => {
        expect(res).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${apiUrl}/10`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('update', () => {
    it('should PUT an updated task', () => {
      const mockTask: TaskRequest = { description: 'Updated', dueDate: new Date() };
      const mockResponse: Task = { id: 5, ...mockTask, status: 'PENDING' } as any;

      service.update(5, mockTask).subscribe((res) => {
        expect(res).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${apiUrl}/5`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(mockTask);
      req.flush(mockResponse);
    });
  });

  describe('updateStatus', () => {
    it('should PATCH task status', () => {
      const statusUpdate: StatusUpdateRequest = { status: StatusEnum.DONE };
      const mockResponse: Task = {
        id: 3,
        description: 'Task',
        dueDate: new Date(),
        status: 'DONE',
      } as any;

      service.updateStatus(3, statusUpdate).subscribe((res) => {
        expect(res).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${apiUrl}/3/status`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(statusUpdate);
      req.flush(mockResponse);
    });
  });

  describe('delete', () => {
    it('should DELETE a task by ID', () => {
      service.delete(1).subscribe((res) => {
        expect(res).toBeNull();
      });

      const req = httpMock.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });
});
