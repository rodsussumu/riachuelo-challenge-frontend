import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';

import { TaskService } from '../../shared/services/task.service';
import { Task, TaskRequest } from '../../shared/interfaces/task.interface';
import { StatusEnum } from '../../shared/enums/status.enum';
import { DetailsDialog } from '../../shared/components/details-dialog/details-dialog';
import { EditDialog } from '../../shared/components/dialog/edit-dialog';
import { AppHeader } from '../../shared/components/header/header';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatMenuModule,
    MatDialogModule,
    MatSnackBarModule,
    MatDividerModule,
    AppHeader,
  ],
  templateUrl: './tasks.html',
  styleUrls: ['./tasks.scss'],
})
export class Tasks implements OnInit {
  tasks: Task[] = [];
  filteredTasks: Task[] = [];
  statusFilter: 'ALL' | StatusEnum = 'ALL';
  sortOrder: 'ASC' | 'DESC' = 'ASC';
  statusEnum = StatusEnum;

  private statusText: Record<StatusEnum, string> = {
    [StatusEnum.PENDING]: 'Pendente',
    [StatusEnum.IN_PROGRESS]: 'Em andamento',
    [StatusEnum.DONE]: 'Concluída',
  };

  constructor(
    private taskService: TaskService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.loadTasks();
  }

  loadTasks() {
    this.taskService.list().subscribe({
      next: (res) => {
        this.tasks = res;
        this.applyFilters();
      },
      error: () => this.snackBar.open('Erro ao carregar tarefas', 'Fechar', { duration: 3000 }),
    });
  }

  applyFilters() {
    let result = [...this.tasks];

    if (this.statusFilter !== 'ALL') {
      result = result.filter((t) => t.status === this.statusFilter);
    }

    result.sort((a, b) =>
      this.sortOrder === 'ASC'
        ? new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
        : new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime()
    );

    this.filteredTasks = result;
  }

  openDetails(task: Task) {
    const ref = this.dialog.open(DetailsDialog, {
      width: '520px',
      data: task,
    });

    ref.afterClosed().subscribe((res) => {
      if (!res) return;
      if (res.action === 'edit') this.openEdit(task);
      if (res.action === 'delete') this.deleteTask(task);
      if (res.action === 'status') this.setStatus(task, res.status as StatusEnum);
    });
  }

  openEdit(task?: Task) {
    const ref = this.dialog.open(EditDialog, {
      width: '420px',
      data: task ? { ...task } : null,
    });

    ref.afterClosed().subscribe((result) => {
      if (!result) return;

      if (result.action === 'create') {
        this.taskService.create(result.task as TaskRequest).subscribe(() => this.loadTasks());
      }
      if (result.action === 'update') {
        this.taskService.update(result.task.id, result.task).subscribe(() => this.loadTasks());
      }
    });
  }

  setStatus(task: Task, status: StatusEnum) {
    this.taskService.updateStatus(task.id, { status }).subscribe({
      next: () => {
        this.snackBar.open(`Tarefa marcada como ${this.statusText[status]}!`, 'Fechar', {
          duration: 2500,
        });
        this.loadTasks();
      },
      error: () =>
        this.snackBar.open('Não foi possível alterar o status.', 'Fechar', { duration: 3000 }),
    });
  }

  deleteTask(task: Task) {
    this.taskService.delete(task.id).subscribe({
      next: () => {
        this.snackBar.open('Tarefa excluída!', 'Fechar', { duration: 3000 });
        this.loadTasks();
      },
    });
  }
}
