import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-payment-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './payment-layout.component.html',
  styleUrl: './payment-layout.component.scss'
})
export class PaymentLayoutComponent {

}
