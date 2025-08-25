import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DetailsDialog } from './details-dialog';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { StatusEnum } from '../../enums/status.enum';
import { Task } from '../../interfaces/task.interface';

describe('DetailsDialog', () => {
  let component: DetailsDialog;
  let fixture: ComponentFixture<DetailsDialog>;
  let dialogRefSpy: jasmine.SpyObj<MatDialogRef<DetailsDialog>>;

  const mockTask: Task = {
    id: 1,
    description: 'Test Task',
    createdAt: new Date(),
    dueDate: new Date(),
    status: StatusEnum.PENDING,
  };

  beforeEach(async () => {
    dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [DetailsDialog],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MAT_DIALOG_DATA, useValue: mockTask },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DetailsDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should receive injected task data', () => {
    expect(component.data).toEqual(mockTask);
  });

  it('should have correct status labels', () => {
    expect(component.statusLabel[StatusEnum.PENDING]).toBe('Pendente');
    expect(component.statusLabel[StatusEnum.IN_PROGRESS]).toBe('Em andamento');
    expect(component.statusLabel[StatusEnum.DONE]).toBe('Concluída');
  });

  it('close() should call dialogRef.close()', () => {
    component.close();
    expect(dialogRefSpy.close).toHaveBeenCalledWith();
  });

  it('edit() should call dialogRef.close() with action edit', () => {
    component.edit();
    expect(dialogRefSpy.close).toHaveBeenCalledWith({ action: 'edit' });
  });

  it('delete() should call dialogRef.close() with action delete', () => {
    component.delete();
    expect(dialogRefSpy.close).toHaveBeenCalledWith({ action: 'delete' });
  });
});
