import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatToolbar } from '@angular/material/toolbar';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [CommonModule, MatToolbar, RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {}
