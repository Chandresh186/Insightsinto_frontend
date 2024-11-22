import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
// import { NgBootstrapModule } from '../../../../shared/modules/ng-bootstrap.modules';
import { RouterModule } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ForgotPasswordComponent {

}
