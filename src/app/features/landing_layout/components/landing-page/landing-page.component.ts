import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [CommonModule,RouterModule, NgbModule],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class LandingPageComponent {
  public  isNavActive = false;
  public isLightTheme = true;


  toggleNav() {
    this.isNavActive = !this.isNavActive;
  }


  toggleTheme() {
    this.isLightTheme = !this.isLightTheme;
    document.body.classList.toggle('light-theme', this.isLightTheme);
    document.body.classList.toggle('dark-theme', !this.isLightTheme);
  }
}
