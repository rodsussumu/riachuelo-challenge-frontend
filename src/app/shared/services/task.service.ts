import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Task, TaskRequest, StatusUpdateRequest } from '../interfaces/task.interface';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private apiUrl = `${environment.apiUrl}/tasks`;

  constructor(private http: HttpClient) {}

  create(task: TaskRequest): Observable<Task> {
    return this.http.post<Task>(this.apiUrl, task);
  }

  list(status?: string, sort?: string): Observable<Task[]> {
    const params: any = {};
    if (status) params.status = status;
    if (sort) params.sort = sort;

    return this.http.get<Task[]>(this.apiUrl, { params });
  }

  listById(id: number): Observable<Task> {
    return this.http.get<Task>(`${this.apiUrl}/${id}`);
  }

  update(id: number, task: TaskRequest): Observable<Task> {
    return this.http.put<Task>(`${this.apiUrl}/${id}`, task);
  }

  updateStatus(id: number, status: StatusUpdateRequest): Observable<Task> {
    return this.http.patch<Task>(`${this.apiUrl}/${id}/status`, status);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
