import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-payment-success',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './payment-success.component.html',
  styleUrl: './payment-success.component.scss'
})
export class PaymentSuccessComponent implements OnInit {
  isUserLoggedIn!: boolean;
  ngOnInit() {
    this.isUserLoggedIn = localStorage.getItem('currentUser') !== null;
    console.log(this.isUserLoggedIn)
  }


}
