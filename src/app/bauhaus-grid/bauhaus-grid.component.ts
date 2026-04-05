import { Component, ElementRef, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import gsap from 'gsap';

type ShapeType = 'semicircle' | 'quarter' | 'circle' | 'diagonal';

interface GridCell {
  id: number;
  shapeType: ShapeType;
  shapeColor: string;
  bgColor: string;
  initialRotation: number;
}

const PALETTE = [
  '#F0EBE0', // cream
  '#F5F5F5', // white
  '#CC2B2B', // red
  '#F5C800', // yellow
  '#1A4CC7', // blue
  '#2EAD4A', // green
  '#DB1A87', // pink
  '#1A1A1A', // black
];

const COLS = 6;
const ROWS = 6;

@Component({
  selector: 'app-bauhaus-grid',
  standalone: true,
  templateUrl: './bauhaus-grid.component.html',
  styleUrls: ['./bauhaus-grid.component.scss'],
})
export class BauhausGridComponent implements OnInit, AfterViewInit, OnDestroy {
  cells: GridCell[] = [];
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
      const bgIdx = Math.floor(Math.random() * PALETTE.length);
      let shapeIdx: number;
      do {
        shapeIdx = Math.floor(Math.random() * PALETTE.length);
      } while (shapeIdx === bgIdx);

      this.cells.push({
        id: i,
        shapeType: this.pickShape(),
        shapeColor: PALETTE[shapeIdx],
        bgColor: PALETTE[bgIdx],
        initialRotation: rotations[Math.floor(Math.random() * 4)],
      });
    }
  }

  private pickShape(): ShapeType {
    const r = Math.random();
    if (r < 0.30) return 'semicircle';
    if (r < 0.62) return 'quarter';
    if (r < 0.82) return 'circle';
    return 'diagonal';
  }

  private startAnimations(): void {
    const host: Element = this.el.nativeElement;
    const gridCells = host.querySelectorAll('.grid-cell');
    const wrappers = host.querySelectorAll('.shape-wrapper');

    // Entrance stagger from centre
    gsap.from(gridCells, {
      scale: 0,
      opacity: 0,
      duration: 0.55,
      ease: 'back.out(1.7)',
      stagger: { from: 'center', amount: 1.1 },
    });

    // Set initial rotations via GSAP
    wrappers.forEach((wrapper: Element, i: number) => {
      gsap.set(wrapper, { rotation: this.cells[i]?.initialRotation ?? 0 });
    });

    // Continuous per-shape rotation + optional scale pulse
    wrappers.forEach((wrapper: Element, i: number) => {
      const duration = 4 + Math.random() * 9;
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
