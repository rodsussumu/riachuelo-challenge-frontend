import { Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatDividerModule,
  ],
  templateUrl: './header.html',
  styleUrls: ['./header.scss'],
})
export class AppHeader {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  private nameSig = signal<string>(this.auth.getUsername());
  username = computed(() => this.nameSig());
  initials = computed(() => (this.username() ? this.username()[0].toUpperCase() : ''));

  constructor() {
    this.auth.checkAuth().subscribe({
      next: (ok) => {
        if (!ok) {
          this.auth.clearUsername();
          this.router.navigateByUrl('/login');
        } else {
          this.nameSig.set(this.auth.getUsername());
        }
      },
      error: () => {
        this.auth.clearUsername();
        this.router.navigateByUrl('/login');
      },
    });
    effect(() => {});
  }

  goTasks() {
    this.router.navigateByUrl('/tasks');
  }

  logout() {
    this.auth.logout().subscribe({
      next: () => this.router.navigateByUrl('/login'),
      error: () => this.router.navigateByUrl('/login'),
    });
  }
}
