import { Component, Inject, ViewEncapsulation } from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogActions,
  MatDialogContent,
  MatDialogTitle,
  MatDialogClose,
} from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { Task } from '../../interfaces/task.interface';
import { StatusEnum } from '../../enums/status.enum';

type TaskForm = {
  title: FormControl<string>;
  description: FormControl<string>;
  dueDate: FormControl<Date | null>;
};

@Component({
  selector: 'app-edit-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    MatDialogActions,
    MatDialogContent,
    MatDialogTitle,
    MatDialogClose,
  ],
  templateUrl: './edit-dialog.html',
  styleUrls: ['./edit-dialog.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class EditDialog {
  form: FormGroup<TaskForm>;
  today = new Date();

  statusLabel: Record<StatusEnum, string> = {
    [StatusEnum.PENDING]: 'Pendente',
    [StatusEnum.IN_PROGRESS]: 'Em andamento',
    [StatusEnum.DONE]: 'Concluída',
  };

  constructor(
    private dialogRef: MatDialogRef<EditDialog>,
    @Inject(MAT_DIALOG_DATA) public data: Task | null
  ) {
    const initialDate = data?.dueDate ? new Date(data.dueDate) : null;

    this.form = new FormGroup<TaskForm>({
      title: new FormControl<string>(data?.title || '', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(3), Validators.maxLength(100)],
      }),
      description: new FormControl<string>('', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(3), Validators.maxLength(255)],
      }),
      dueDate: new FormControl<Date | null>(initialDate, {
        validators: [Validators.required, this.minDateValidator(this.today)],
      }),
    });

    if (data) {
      this.form.patchValue({
        description: data.description,
        dueDate: initialDate,
      });
    }
  }

  get f() {
    return this.form.controls;
  }

  private minDateValidator(min: Date): ValidatorFn {
    const floor = new Date(min.getFullYear(), min.getMonth(), min.getDate());
    return (control: AbstractControl): ValidationErrors | null => {
      const v = control.value as Date | null;
      if (!v) return null;
      const d = new Date(v.getFullYear(), v.getMonth(), v.getDate());
      return d < floor ? { minDate: true } : null;
    };
  }

  save() {
    if (this.form.invalid) return;
    const task = { ...this.data, ...this.form.value };
    this.dialogRef.close({ action: this.data ? 'update' : 'create', task });
  }

  delete() {
    this.dialogRef.close({ action: 'delete', task: this.data });
  }

  cancel() {
    this.dialogRef.close();
  }
}
