import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Tasks } from './tasks';
import { TaskService } from '../../shared/services/task.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';
import { Task } from '../../shared/interfaces/task.interface';
import { StatusEnum } from '../../shared/enums/status.enum';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('Tasks Page', () => {
  let component: Tasks;
  let fixture: ComponentFixture<Tasks>;
  let taskService: jasmine.SpyObj<TaskService>;
  let snackBarSvc: MatSnackBar;
  let dialogSvc: MatDialog;

  const mockTask: Task = {
    id: 1,
    title: 'My Task',
    description: 'Desc',
    status: StatusEnum.PENDING,
    createdAt: new Date(2024, 0, 1),
    dueDate: new Date(2024, 0, 2),
  };

  beforeEach(async () => {
    const taskSpy = jasmine.createSpyObj<TaskService>('TaskService', [
      'list',
      'listById',
      'create',
      'update',
      'updateStatus',
      'delete',
    ]);
    const snackBarSpy = jasmine.createSpyObj<MatSnackBar>('MatSnackBar', ['open']);
    const dialogSpy = jasmine.createSpyObj<MatDialog>('MatDialog', ['open']);

    await TestBed.configureTestingModule({
      imports: [Tasks],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: TaskService, useValue: taskSpy },
        { provide: MatSnackBar, useValue: snackBarSpy },
        { provide: MatDialog, useValue: dialogSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Tasks);
    component = fixture.componentInstance;

    taskService = TestBed.inject(TaskService) as jasmine.SpyObj<TaskService>;
    snackBarSvc = TestBed.inject(MatSnackBar);
    dialogSvc = TestBed.inject(MatDialog);

    taskService.list.and.returnValue(of([]));
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should call loadTasks on init', () => {
    const loadSpy = spyOn(component, 'loadTasks');
    fixture.detectChanges();
    expect(loadSpy).toHaveBeenCalledTimes(1);
  });

  it('loadTasks should show error snackbar on failure', fakeAsync(() => {
    taskService.list.and.returnValue(throwError(() => new Error('boom')));
    const sbSpy = spyOn((component as any).snackBar, 'open');

    component.loadTasks();
    tick();

    expect(sbSpy).toHaveBeenCalledWith(
      'Erro ao carregar tarefas',
      'Fechar',
      jasmine.objectContaining({ duration: 3000 })
    );
  }));

  it('setStatus should update and notify success', fakeAsync(() => {
    const updatedTask: Task = { ...mockTask, status: StatusEnum.DONE };
    taskService.updateStatus.and.returnValue(of(updatedTask));
    taskService.list.and.returnValue(of([updatedTask]));
    const sbSpy = spyOn((component as any).snackBar, 'open');

    component.setStatus(mockTask, StatusEnum.DONE);
    tick();

    expect(taskService.updateStatus).toHaveBeenCalledWith(mockTask.id, { status: StatusEnum.DONE });
    expect(sbSpy).toHaveBeenCalledWith(
      'Tarefa marcada como Concluída!',
      'Fechar',
      jasmine.objectContaining({ duration: 2500 })
    );
  }));

  it('setStatus should show error snackbar on failure', fakeAsync(() => {
    taskService.updateStatus.and.returnValue(throwError(() => new Error('nope')));
    const sbSpy = spyOn((component as any).snackBar, 'open');

    component.setStatus(mockTask, StatusEnum.DONE);
    tick();

    expect(sbSpy).toHaveBeenCalledWith(
      'Não foi possível alterar o status.',
      'Fechar',
      jasmine.objectContaining({ duration: 3000 })
    );
  }));

  it('deleteTask should delete and reload with success snackbar', fakeAsync(() => {
    taskService.delete.and.returnValue(of(void 0));
    taskService.list.and.returnValue(of([]));
    const sbSpy = spyOn((component as any).snackBar, 'open');

    component.deleteTask(mockTask);
    tick();

    expect(taskService.delete).toHaveBeenCalledWith(mockTask.id);
    expect(sbSpy).toHaveBeenCalledWith(
      'Tarefa excluída!',
      'Fechar',
      jasmine.objectContaining({ duration: 3000 })
    );
  }));

  it('openEdit should call taskService.create when action is "create"', fakeAsync(() => {
    taskService.create.and.returnValue(of(mockTask));
    taskService.list.and.returnValue(of([mockTask]));
    const dialogRefMock = { afterClosed: () => of({ action: 'create', task: mockTask }) } as any;

    spyOn((component as any).dialog, 'open').and.returnValue(dialogRefMock);

    component.openEdit();
    tick();

    expect(taskService.create).toHaveBeenCalledWith(mockTask);
  }));

  it('openEdit should call taskService.update when action is "update"', fakeAsync(() => {
    taskService.update.and.returnValue(of(mockTask));
    taskService.list.and.returnValue(of([mockTask]));
    const dialogRefMock = { afterClosed: () => of({ action: 'update', task: mockTask }) } as any;

    spyOn((component as any).dialog, 'open').and.returnValue(dialogRefMock);

    component.openEdit(mockTask);
    tick();

    expect(taskService.update).toHaveBeenCalledWith(mockTask.id, mockTask);
  }));

  it('openEdit should do nothing when dialog returns null', fakeAsync(() => {
    const dialogRefMock = { afterClosed: () => of(null) } as any;

    spyOn((component as any).dialog, 'open').and.returnValue(dialogRefMock);

    const createSpy = taskService.create;
    const updateSpy = taskService.update;

    component.openEdit(mockTask);
    tick();

    expect(createSpy).not.toHaveBeenCalled();
    expect(updateSpy).not.toHaveBeenCalled();
  }));

  it('openDetails should call openEdit when action is "edit"', fakeAsync(() => {
    const dialogRefMock = { afterClosed: () => of({ action: 'edit' }) } as any;
    spyOn((component as any).dialog, 'open').and.returnValue(dialogRefMock);
    const openEditSpy = spyOn(component, 'openEdit');

    component.openDetails(mockTask);
    tick();

    expect(openEditSpy).toHaveBeenCalledWith(mockTask);
  }));

  it('openDetails should call deleteTask when action is "delete"', fakeAsync(() => {
    const dialogRefMock = { afterClosed: () => of({ action: 'delete' }) } as any;
    spyOn((component as any).dialog, 'open').and.returnValue(dialogRefMock);
    const deleteSpy = spyOn(component, 'deleteTask');

    component.openDetails(mockTask);
    tick();

    expect(deleteSpy).toHaveBeenCalledWith(mockTask);
  }));

  it('openDetails should call setStatus when action is "status"', fakeAsync(() => {
    const dialogRefMock = {
      afterClosed: () => of({ action: 'status', status: StatusEnum.DONE }),
    } as any;
    spyOn((component as any).dialog, 'open').and.returnValue(dialogRefMock);
    const setStatusSpy = spyOn(component, 'setStatus');

    component.openDetails(mockTask);
    tick();

    expect(setStatusSpy).toHaveBeenCalledWith(mockTask, StatusEnum.DONE);
  }));

  it('openDetails should do nothing when dialog returns null', fakeAsync(() => {
    const dialogRefMock = { afterClosed: () => of(null) } as any;
    spyOn((component as any).dialog, 'open').and.returnValue(dialogRefMock);

    const editSpy = spyOn(component, 'openEdit');
    const delSpy = spyOn(component, 'deleteTask');
    const statusSpy = spyOn(component, 'setStatus');

    component.openDetails(mockTask);
    tick();

    expect(editSpy).not.toHaveBeenCalled();
    expect(delSpy).not.toHaveBeenCalled();
    expect(statusSpy).not.toHaveBeenCalled();
  }));

  it('applyFilters should filter tasks when statusFilter is not "ALL"', () => {
    const t1: Task = {
      id: 1,
      title: 'Task A',
      description: 'A',
      status: StatusEnum.PENDING,
      createdAt: new Date(2024, 0, 1),
      dueDate: new Date(2024, 0, 1),
    };
    const t2: Task = {
      id: 2,
      title: 'Task B',
      description: 'B',
      status: StatusEnum.DONE,
      createdAt: new Date(2024, 0, 1),
      dueDate: new Date(2024, 0, 2),
    };
    const t3: Task = {
      id: 3,
      title: 'Task C',
      description: 'C',
      status: StatusEnum.IN_PROGRESS,
      createdAt: new Date(2024, 0, 1),
      dueDate: new Date(2024, 0, 3),
    };

    component.tasks = [t1, t2, t3];
    component.statusFilter = StatusEnum.DONE;
    component.sortOrder = 'ASC';
    component.applyFilters();

    expect(component.filteredTasks.length).toBe(1);
    expect(component.filteredTasks[0].id).toBe(2);
    expect(component.filteredTasks[0].status).toBe(StatusEnum.DONE);
  });

  it('applyFilters should sort by dueDate ASC when sortOrder is "ASC"', () => {
    const early: Task = {
      id: 10,
      title: 'Early',
      description: 'early',
      status: StatusEnum.PENDING,
      createdAt: new Date(2024, 0, 1),
      dueDate: new Date(2024, 0, 1),
    };
    const late: Task = {
      id: 11,
      title: 'Late',
      description: 'late',
      status: StatusEnum.PENDING,
      createdAt: new Date(2024, 0, 1),
      dueDate: new Date(2024, 0, 5),
    };

    component.tasks = [late, early];
    component.statusFilter = 'ALL';
    component.sortOrder = 'ASC';
    component.applyFilters();

    expect(component.filteredTasks.map((t) => t.id)).toEqual([10, 11]);
  });

  it('applyFilters should sort by dueDate DESC when sortOrder is "DESC"', () => {
    const early: Task = {
      id: 20,
      title: 'Early',
      description: 'early',
      status: StatusEnum.PENDING,
      createdAt: new Date(2024, 0, 1),
      dueDate: new Date(2024, 0, 1),
    };
    const late: Task = {
      id: 21,
      title: 'Late',
      description: 'late',
      status: StatusEnum.PENDING,
      createdAt: new Date(2024, 0, 1),
      dueDate: new Date(2024, 0, 5),
    };

    component.tasks = [early, late];
    component.statusFilter = 'ALL';
    component.sortOrder = 'DESC';
    component.applyFilters();

    expect(component.filteredTasks.map((t) => t.id)).toEqual([21, 20]);
  });
});
