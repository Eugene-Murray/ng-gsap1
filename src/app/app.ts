import { Component } from '@angular/core';
import { BauhausGridComponent } from './bauhaus-grid/bauhaus-grid.component';
import { BauhausBlueComponent } from './bauhaus-blue/bauhaus-blue.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [BauhausGridComponent, BauhausBlueComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {}
