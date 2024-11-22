import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ngbootstrapModule } from '../../../../shared/modules/ng-bootstrap.modules';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, ngbootstrapModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class HeaderComponent {

}
