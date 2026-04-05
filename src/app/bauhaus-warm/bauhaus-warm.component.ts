import { Component, ElementRef, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import gsap from 'gsap';

type WarmShape = 'semicircle' | 'quarter' | 'circle' | 'triangle' | 'stripes' | 'diamond' | 'star4';

interface WarmCell {
  id: number;
  shapeType: WarmShape;
  shapeColor: string;
  bgColor: string;
  accentColor: string;
  initialRotation: number;
}

const CREAM = '#F5EDD6';
const RED = '#E63929';
const BLACK = '#1A1A1A';
const GREEN = '#1A7A3C';
const YELLOW = '#F5A800';
const ORANGE = '#F07514';

const WARM_COLORS = [CREAM, RED, BLACK, GREEN, YELLOW, ORANGE];
const COLS = 4;
const ROWS = 5;

@Component({
  selector: 'app-bauhaus-warm',
  standalone: true,
  templateUrl: './bauhaus-warm.component.html',
  styleUrls: ['./bauhaus-warm.component.scss'],
})
export class BauhausWarmComponent implements OnInit, AfterViewInit, OnDestroy {
  cells: WarmCell[] = [];
  private rotTweens: gsap.core.Tween[] = [];
  private scaleTweens: gsap.core.Tween[] = [];

  readonly bauhausLetters: { char: string; color: string }[] = [
    { char: 'B', color: BLACK },
    { char: 'A', color: RED },
    { char: 'U', color: BLACK },
    { char: 'H', color: RED },
    { char: 'A', color: GREEN },
    { char: 'U', color: ORANGE },
    { char: 'S', color: RED },
  ];

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
      const bgIdx = Math.floor(Math.random() * WARM_COLORS.length);
      let shapeIdx: number;
      do {
        shapeIdx = Math.floor(Math.random() * WARM_COLORS.length);
      } while (shapeIdx === bgIdx);

      let accentIdx: number;
      do {
        accentIdx = Math.floor(Math.random() * WARM_COLORS.length);
      } while (accentIdx === bgIdx || accentIdx === shapeIdx);

      this.cells.push({
        id: i,
        shapeType: this.pickShape(),
        shapeColor: WARM_COLORS[shapeIdx],
        bgColor: WARM_COLORS[bgIdx],
        accentColor: WARM_COLORS[accentIdx],
        initialRotation: rotations[Math.floor(Math.random() * 4)],
      });
    }
  }

  private pickShape(): WarmShape {
    const r = Math.random();
    if (r < 0.22) return 'quarter';
    if (r < 0.42) return 'semicircle';
    if (r < 0.55) return 'circle';
    if (r < 0.65) return 'triangle';
    if (r < 0.76) return 'stripes';
    if (r < 0.88) return 'diamond';
    return 'star4';
  }

  private startAnimations(): void {
    const host: Element = this.el.nativeElement;
    const gridCells = host.querySelectorAll('.warm-cell');
    const wrappers = host.querySelectorAll('.warm-shape-wrapper');

    gsap.from(gridCells, {
      scale: 0,
      opacity: 0,
      duration: 0.55,
      ease: 'back.out(1.7)',
      stagger: { from: 'edges', amount: 1.2 },
    });

    wrappers.forEach((wrapper: Element, i: number) => {
      gsap.set(wrapper, { rotation: this.cells[i]?.initialRotation ?? 0 });
    });

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
