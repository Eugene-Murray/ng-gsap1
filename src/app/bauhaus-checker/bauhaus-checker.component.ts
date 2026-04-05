import { Component, ElementRef, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import gsap from 'gsap';

type CheckerShape = 'shadow' | 'accent';

interface CheckerCell {
  id: number;
  shapeType: CheckerShape;
  accentColor: string;
  initialRotation: number;
}

const CREAM = '#F0EBD8';
const BLACK = '#1A1A1A';
const RED = '#D93B2C';
const YELLOW = '#E8A100';
const BLUE = '#1A4CC7';

const ACCENT_COLORS = [BLUE, YELLOW, RED];
const COLS = 5;
const ROWS = 6;

@Component({
  selector: 'app-bauhaus-checker',
  standalone: true,
  templateUrl: './bauhaus-checker.component.html',
  styleUrls: ['./bauhaus-checker.component.scss'],
})
export class BauhausCheckerComponent implements OnInit, AfterViewInit, OnDestroy {
  cells: CheckerCell[] = [];
  readonly cream = CREAM;
  readonly black = BLACK;
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
    let accentCounter = 0;
    const rotations = [0, 90, 180, 270];

    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const isShadow = (row + col) % 2 === 0;
        this.cells.push({
          id: row * COLS + col,
          shapeType: isShadow ? 'shadow' : 'accent',
          accentColor: isShadow ? '' : ACCENT_COLORS[accentCounter++ % ACCENT_COLORS.length],
          initialRotation: rotations[Math.floor(Math.random() * 4)],
        });
      }
    }
  }

  private startAnimations(): void {
    const host: Element = this.el.nativeElement;
    const cells = host.querySelectorAll('.ck-cell');
    const wrappers = host.querySelectorAll('.ck-wrapper');

    gsap.from(cells, {
      y: -50,
      opacity: 0,
      duration: 0.5,
      ease: 'power3.out',
      stagger: { from: 'start', amount: 1.3 },
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

      if (Math.random() > 0.5) {
        const scale = gsap.to(wrapper, {
          scale: 0.72 + Math.random() * 0.22,
          duration: 1.5 + Math.random() * 3,
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true,
          delay: Math.random() * 2,
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
