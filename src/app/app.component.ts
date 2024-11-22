import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  
})
export class AppComponent {
  title = 'insightInto';
  public themeColor = null;
  
  // public themeColor = 'restoreDarkMode';
}
