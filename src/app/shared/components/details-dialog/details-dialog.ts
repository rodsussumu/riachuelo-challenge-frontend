import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogActions,
  MatDialogContent,
  MatDialogTitle,
  MatDialogClose,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Task } from '../../interfaces/task.interface';
import { StatusEnum } from '../../enums/status.enum';

@Component({
  selector: 'app-details-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatDialogActions,
    MatDialogContent,
    MatDialogTitle,
    MatDialogClose,
  ],
  templateUrl: './details-dialog.html',
  styleUrls: ['./details-dialog.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class DetailsDialog {
  statusLabel: Record<StatusEnum, string> = {
    [StatusEnum.PENDING]: 'Pendente',
    [StatusEnum.IN_PROGRESS]: 'Em andamento',
    [StatusEnum.DONE]: 'Concluída',
  };

  constructor(
    private ref: MatDialogRef<DetailsDialog>,
    @Inject(MAT_DIALOG_DATA) public data: Task
  ) {}

  close() {
    this.ref.close();
  }
  edit() {
    this.ref.close({ action: 'edit' });
  }
  delete() {
    this.ref.close({ action: 'delete' });
  }
}
