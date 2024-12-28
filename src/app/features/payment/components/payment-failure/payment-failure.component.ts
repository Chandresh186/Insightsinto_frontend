import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-payment-failure',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './payment-failure.component.html',
  styleUrl: './payment-failure.component.scss'
})
export class PaymentFailureComponent implements OnInit {
  isUserLoggedIn!: boolean;
  ngOnInit() {
    this.isUserLoggedIn = localStorage.getItem('currentUser') !== null;
  }
}
