import { Component } from '@angular/core';
import { BauhausGridComponent } from './bauhaus-grid/bauhaus-grid.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [BauhausGridComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {}
