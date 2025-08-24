// src/app/shared/components/task-dialog/task-dialog.component.ts
import { Component, Inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
} from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { CommonModule } from '@angular/common';
import { Task } from '../../interfaces/task.interface';

@Component({
  selector: 'app-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDialogActions,
    MatDialogContent,
  ],
  templateUrl: './dialog.html',
  styleUrls: ['./dialog.scss'],
})
export class DialogComponent {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<DialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Task
  ) {
    this.form = this.fb.group({
      description: [data?.description || '', Validators.required],
      dueDate: [data?.dueDate ? new Date(data.dueDate) : '', Validators.required],
    });
  }

  save() {
    if (this.form.valid) {
      const task = { ...this.data, ...this.form.value };
      this.dialogRef.close({ action: this.data ? 'update' : 'create', task });
    }
  }

  delete() {
    this.dialogRef.close({ action: 'delete', task: this.data });
  }

  cancel() {
    this.dialogRef.close();
  }
}
