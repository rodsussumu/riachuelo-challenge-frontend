import { StatusEnum } from '../enums/status.enum';

export interface TaskRequest {
  title: string;
  description: string;
  dueDate: Date;
}

export interface Task {
  id: number;
  title: string;
  description: string;
  createdAt: Date;
  dueDate: Date;
  status: StatusEnum;
}

export interface StatusUpdateRequest {
  status: StatusEnum;
}
