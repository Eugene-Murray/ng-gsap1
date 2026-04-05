import { Component, ElementRef, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import gsap from 'gsap';

type BlueShape = 'semicircle' | 'circle';

interface BlueCell {
  id: number;
  shapeType: BlueShape;
  shapeColor: string;
  initialRotation: number;
}

const BG = '#F5F0E8'; // warm cream background for every cell

const BLUES = [
  '#0B1F72', // darkest navy
  '#1A3BBD', // dark cobalt
  '#3D66E0', // medium royal blue
  '#7AA0F0', // cornflower
  '#B8CEF7', // lightest periwinkle
];

const COLS = 4;
const ROWS = 5;

@Component({
  selector: 'app-bauhaus-blue',
  standalone: true,
  templateUrl: './bauhaus-blue.component.html',
  styleUrls: ['./bauhaus-blue.component.scss'],
})
export class BauhausBlueComponent implements OnInit, AfterViewInit, OnDestroy {
  cells: BlueCell[] = [];
  readonly bg = BG;
  private rotTweens: gsap.core.Tween[] = [];
  private scaleTweens: gsap.core.Tween[] = [];

  constructor(private el: ElementRef) {}

  ngOnInit(): void {
    this.buildGrid();
  }

  ngAfterViewInit(): void {
    this.startAnimations();
  }

  private buildGrid(): void {
    this.cells = [];
    const rotations = [0, 90, 180, 270];
    for (let i = 0; i < COLS * ROWS; i++) {
      this.cells.push({
        id: i,
        shapeType: Math.random() > 0.35 ? 'semicircle' : 'circle',
        shapeColor: BLUES[Math.floor(Math.random() * BLUES.length)],
        initialRotation: rotations[Math.floor(Math.random() * 4)],
      });
    }
  }

  private startAnimations(): void {
    const host: Element = this.el.nativeElement;
    const gridCells = host.querySelectorAll('.blue-cell');
    const wrappers = host.querySelectorAll('.blue-shape-wrapper');

    gsap.from(gridCells, {
      scale: 0,
      opacity: 0,
      duration: 0.6,
      ease: 'back.out(1.5)',
      stagger: { from: 'start', amount: 1.2 },
    });

    wrappers.forEach((wrapper: Element, i: number) => {
      gsap.set(wrapper, { rotation: this.cells[i]?.initialRotation ?? 0 });
    });

    wrappers.forEach((wrapper: Element, i: number) => {
      const duration = 5 + Math.random() * 10;
      const direction = Math.random() > 0.5 ? 360 : -360;

      const rot = gsap.to(wrapper, {
        rotation: `+=${direction}`,
        duration,
        ease: 'none',
        repeat: -1,
      });
      this.rotTweens.push(rot);

      if (Math.random() > 0.45) {
        const scale = gsap.to(wrapper, {
          scale: 0.68 + Math.random() * 0.26,
          duration: 1.8 + Math.random() * 3.5,
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true,
          delay: Math.random() * 2.5,
        });
        this.scaleTweens.push(scale);
      }
    });
  }

  private killAll(): void {
    this.rotTweens.forEach(t => t.kill());
    this.scaleTweens.forEach(t => t.kill());
    this.rotTweens = [];
    this.scaleTweens = [];
  }

  onCellEnter(index: number): void {
    const rot = this.rotTweens[index];
    if (rot) gsap.to(rot, { timeScale: 5, duration: 0.3 });
  }

  onCellLeave(index: number): void {
    const rot = this.rotTweens[index];
    if (rot) gsap.to(rot, { timeScale: 1, duration: 0.6 });
  }

  regenerate(): void {
    this.killAll();
    this.buildGrid();
    setTimeout(() => this.startAnimations(), 50);
  }

  ngOnDestroy(): void {
    this.killAll();
  }
}
