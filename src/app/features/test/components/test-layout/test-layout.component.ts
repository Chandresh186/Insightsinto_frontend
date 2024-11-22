import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-test-layout',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './test-layout.component.html',
  styleUrls: ['./test-layout.component.css']
})
export class TestLayoutComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
