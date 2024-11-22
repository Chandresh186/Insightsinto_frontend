import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-async-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './async-button.component.html',
  styleUrl: './async-button.component.scss'
})
export class AsyncButtonComponent {
  @Input() isAsyncCall!: boolean;
  @Input() disabled!: boolean;
  @Input() type!: string;
  @Input() classes!: string;
}
