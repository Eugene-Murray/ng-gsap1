import { Component } from '@angular/core';
import { BauhausGridComponent } from './bauhaus-grid/bauhaus-grid.component';
import { BauhausBlueComponent } from './bauhaus-blue/bauhaus-blue.component';
import { BauhausWarmComponent } from './bauhaus-warm/bauhaus-warm.component';
import { BauhausCheckerComponent } from './bauhaus-checker/bauhaus-checker.component';
import { BauhausPinwheelComponent } from './bauhaus-pinwheel/bauhaus-pinwheel.component';
import { BauhausWaveComponent } from './bauhaus-wave/bauhaus-wave.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [BauhausGridComponent, BauhausBlueComponent, BauhausWarmComponent, BauhausCheckerComponent, BauhausPinwheelComponent, BauhausWaveComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {}
