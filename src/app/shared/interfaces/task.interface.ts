import { StatusEnum } from '../enums/status.enum';

export interface TaskRequest {
  description: string;
  dueDate: Date;
}

export interface Task {
  id: number;
  description: string;
  createdAt: Date;
  dueDate: Date;
  status: StatusEnum;
}

export interface StatusUpdateRequest {
  status: StatusEnum;
}
