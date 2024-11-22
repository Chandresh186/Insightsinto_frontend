import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class LayoutComponent {
  public  isNavActive = false;
  public isLightTheme = true;

  currentRoute: string = '';

  constructor(private router: Router) {}

  toggleNav() {
    this.isNavActive = !this.isNavActive;
  }

  toggleTheme() {
    this.isLightTheme = !this.isLightTheme;
    document.body.classList.toggle('light-theme', this.isLightTheme);
    document.body.classList.toggle('dark-theme', !this.isLightTheme);
  }

  ngOnInit() {
      
  }
}
