import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EditDialog } from './edit-dialog';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ReactiveFormsModule } from '@angular/forms';
import { StatusEnum } from '../../enums/status.enum';
import { Task } from '../../interfaces/task.interface';

describe('EditDialog', () => {
  let component: EditDialog;
  let fixture: ComponentFixture<EditDialog>;
  let dialogRefSpy: jasmine.SpyObj<MatDialogRef<EditDialog>>;

  describe('without data (create mode)', () => {
    beforeEach(async () => {
      dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

      await TestBed.configureTestingModule({
        imports: [ReactiveFormsModule, EditDialog],
        providers: [
          { provide: MatDialogRef, useValue: dialogRefSpy },
          { provide: MAT_DIALOG_DATA, useValue: null },
        ],
      }).compileComponents();

      fixture = TestBed.createComponent(EditDialog);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should create component', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize form with no data', () => {
      expect(component.form.value.title).toBe('');
      expect(component.form.value.description).toBe('');
      expect(component.form.value.dueDate).toBeNull();
    });

    it('get f() should return form controls', () => {
      expect(component.f.title).toBeTruthy();
      expect(component.f.description).toBeTruthy();
      expect(component.f.dueDate).toBeTruthy();
    });

    it('minDateValidator should invalidate past date', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      const validator = component['minDateValidator'](new Date());
      const res = validator({ value: pastDate } as any);
      expect(res).toEqual({ minDate: true });
    });

    it('minDateValidator should allow today or future date', () => {
      const today = new Date();
      const validator = component['minDateValidator'](today);
      const res = validator({ value: today } as any);
      expect(res).toBeNull();
    });

    it('save() should not close dialog if form is invalid', () => {
      component.form.controls['title'].setValue('');
      component.form.controls['description'].setValue('');
      component.form.controls['dueDate'].setValue(null);
      component.save();
      expect(dialogRefSpy.close).not.toHaveBeenCalled();
    });

    it('save() should close dialog with "create"', () => {
      component.form.controls['title'].setValue('Task title');
      component.form.controls['description'].setValue('Task ok');
      component.form.controls['dueDate'].setValue(new Date());
      component.save();

      expect(dialogRefSpy.close).toHaveBeenCalledWith(
        jasmine.objectContaining({
          action: 'create',
          task: jasmine.any(Object),
        })
      );
    });

    it('delete() should close dialog with action delete', () => {
      component.data = {
        id: 1,
        title: 'Delete me',
        description: 'to remove',
        createdAt: new Date(),
        dueDate: new Date(),
        status: StatusEnum.IN_PROGRESS,
      };
      component.delete();
      expect(dialogRefSpy.close).toHaveBeenCalledWith({
        action: 'delete',
        task: component.data,
      });
    });

    it('cancel() should just close dialog', () => {
      component.cancel();
      expect(dialogRefSpy.close).toHaveBeenCalled();
    });
  });

  describe('with data (update mode)', () => {
    const testData: Task = {
      id: 1,
      title: 'Existing title',
      description: 'Existing task',
      createdAt: new Date(),
      dueDate: new Date(),
      status: StatusEnum.PENDING,
    };

    beforeEach(async () => {
      dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

      await TestBed.configureTestingModule({
        imports: [ReactiveFormsModule, EditDialog],
        providers: [
          { provide: MatDialogRef, useValue: dialogRefSpy },
          { provide: MAT_DIALOG_DATA, useValue: testData },
        ],
      }).compileComponents();

      fixture = TestBed.createComponent(EditDialog);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should patch form when data is provided', () => {
      expect(component.form.value.title).toBe('Existing title');
      expect(component.form.value.description).toBe('Existing task');
    });

    it('save() should close dialog with "update"', () => {
      component.form.controls['title'].setValue('Updated title');
      component.form.controls['description'].setValue('Updated desc');
      component.form.controls['dueDate'].setValue(new Date());
      component.save();

      expect(dialogRefSpy.close).toHaveBeenCalledWith(
        jasmine.objectContaining({
          action: 'update',
          task: jasmine.any(Object),
        })
      );
    });
  });
});
