import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TaskService } from '../../shared/services/task.service';
import { Task, TaskRequest } from '../../shared/interfaces/task.interface';
import { StatusEnum } from '../../shared/enums/status.enum';
import { FormsModule } from '@angular/forms';
import { DialogComponent } from '../../shared/components/dialog/dialog';

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
    MatDialogModule,
    MatSnackBarModule,
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

  toggleStatus(task: Task) {
    if (task.status === StatusEnum.PENDING) {
      this.taskService.updateStatus(task.id, { status: StatusEnum.DONE }).subscribe({
        next: () => {
          this.snackBar.open('Tarefa concluída!', 'Fechar', { duration: 3000 });
          this.loadTasks();
        },
      });
    } else if (task.status === StatusEnum.DONE) {
      this.deleteTask(task);
    }
  }

  deleteTask(task: Task) {
    this.taskService.delete(task.id).subscribe({
      next: () => {
        this.snackBar.open('Tarefa excluída!', 'Fechar', { duration: 3000 });
        this.loadTasks();
      },
    });
  }

  openTaskDialog(task?: Task) {
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '400px',
      data: task ? { ...task } : null,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.action === 'create') {
        this.taskService.create(result.task as TaskRequest).subscribe(() => this.loadTasks());
      } else if (result?.action === 'update') {
        this.taskService.update(result.task.id, result.task).subscribe(() => this.loadTasks());
      } else if (result?.action === 'delete') {
        this.taskService.delete(result.task.id).subscribe(() => this.loadTasks());
      }
    });
  }
}
