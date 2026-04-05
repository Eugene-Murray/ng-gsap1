import { Component, ElementRef, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import gsap from 'gsap';

interface WaveBand {
  d: string;
  fill: string;
}

interface SunRay {
  d: string;
  fill: string;
}

const SVG_W = 360;
const HORIZON_Y = 240;
const WAVE_BOTTOM = 420;
const CENTER_X = SVG_W / 2;
const DOUBLE_W = SVG_W * 2; // 720 — double width for seamless scroll loop

// Symmetric warm palette: pinks at sides → orange → yellow at top centre
const RAY_PALETTE = ['#D41E78', '#C82828', '#E05818', '#F0A010', '#F0A010', '#E05818', '#C82828', '#D41E78'];

@Component({
  selector: 'app-bauhaus-wave',
  standalone: true,
  templateUrl: './bauhaus-wave.component.html',
  styleUrls: ['./bauhaus-wave.component.scss'],
})
export class BauhausWaveComponent implements OnInit, AfterViewInit, OnDestroy {
  sunRays: SunRay[] = [];
  waveBands: WaveBand[] = [];

  readonly svgW = SVG_W;
  readonly svgH = WAVE_BOTTOM;
  readonly horizonY = HORIZON_Y;
  // Unique clip-path IDs per component instance to avoid collisions
  readonly compId = `bhw-${Math.random().toString(36).slice(2, 8)}`;

  private sunAngle = { val: 0 };
  private waveX = { val: 0 };
  private tweens: gsap.core.Tween[] = [];
  private sunEl: Element | null = null;
  private waveEl: Element | null = null;

  constructor(private el: ElementRef) {}

  ngOnInit(): void {
    this.buildSunburst();
    this.buildWaves();
  }

  ngAfterViewInit(): void {
    const host: Element = this.el.nativeElement;
    this.sunEl = host.querySelector('.ws-sunburst');
    this.waveEl = host.querySelector('.ws-waves');
    this.entrance();
    this.startAnimations();
  }

  // ── Data builders ───────────────────────────────────────────────────────────

  private buildSunburst(): void {
    this.sunRays = [];
    const NUM = 16;
    const STEP = 180 / NUM; // 11.25° per ray, spanning 180° (upper semicircle)
    const R = 460;          // radius large enough to reach corners of the viewBox

    for (let i = 0; i < NUM; i++) {
      // Skip odd indices — white gap rays show the cream background through
      if (i % 2 !== 0) continue;

      // Standard angle: 180° = pointing left, 360°/0° = pointing right
      const a1 = ((180 + i * STEP) * Math.PI) / 180;
      const a2 = ((180 + (i + 1) * STEP) * Math.PI) / 180;

      const x1 = (CENTER_X + R * Math.cos(a1)).toFixed(2);
      const y1 = (HORIZON_Y + R * Math.sin(a1)).toFixed(2);
      const x2 = (CENTER_X + R * Math.cos(a2)).toFixed(2);
      const y2 = (HORIZON_Y + R * Math.sin(a2)).toFixed(2);

      this.sunRays.push({
        d: `M ${CENTER_X} ${HORIZON_Y} L ${x1} ${y1} L ${x2} ${y2} Z`,
        fill: RAY_PALETTE[i / 2],
      });
    }
  }

  private buildWaves(): void {
    this.waveBands = [];
    const NUM = 8;
    const BAND_H = (WAVE_BOTTOM - HORIZON_Y) / NUM; // 22.5px each
    const STEPS = 72;

    for (let b = 0; b < NUM; b++) {
      const baseY = HORIZON_Y + b * BAND_H;
      const fill = b % 2 === 0 ? '#1A1A1A' : '#F5F0E8';
      // Vary amplitudes and phases to create organic, non-uniform hills
      const a1 = 14 + (b % 3) * 4;
      const a2 = 7 + (b % 4) * 2;
      const ph1 = b * 0.9;
      const ph2 = b * 1.4 + 0.6;

      const pts: string[] = [];
      for (let j = 0; j <= STEPS; j++) {
        const t = j / STEPS;
        const x = t * DOUBLE_W;
        // Two overlaid sine waves: c=4 and c=8 cycles per 360px
        // Both satisfy f(x+360)=f(x) so the scroll loop is seamless
        const y =
          baseY +
          a1 * Math.sin(t * 8 * Math.PI + ph1) +  // 4 cycles per 360
          a2 * Math.sin(t * 16 * Math.PI + ph2);  // 8 cycles per 360
        pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
      }

      const bot = (baseY + BAND_H + 2).toFixed(1);
      let d = `M ${pts[0]} `;
      d += pts.slice(1).map(p => `L ${p}`).join(' ');
      d += ` L ${DOUBLE_W},${bot} L 0,${bot} Z`;
      this.waveBands.push({ d, fill });
    }
  }

  // ── GSAP ────────────────────────────────────────────────────────────────────

  private entrance(): void {
    const host: Element = this.el.nativeElement;
    gsap.from(host.querySelector('.wave-poster'), {
      scale: 0.88,
      opacity: 0,
      duration: 0.8,
      ease: 'power2.out',
    });
  }

  private startAnimations(): void {
    this.sunAngle.val = 0;
    this.waveX.val = 0;

    if (this.sunEl) {
      const sunEl = this.sunEl!;
      const sunAngle = this.sunAngle;
      const t = gsap.to(sunAngle, {
        val: 360,
        duration: 28,
        ease: 'none',
        repeat: -1,
        onUpdate() {
          // Use SVG rotate(angle, cx, cy) so rotation is in SVG user-units,
          // independent of any CSS pixel / viewBox scaling
          (sunEl as SVGElement).setAttribute(
            'transform',
            `rotate(${sunAngle.val % 360}, ${CENTER_X}, ${HORIZON_Y})`
          );
        },
      });
      this.tweens.push(t);
    }

    if (this.waveEl) {
      const waveEl = this.waveEl!;
      const waveX = this.waveX;
      const t = gsap.to(waveX, {
        val: -SVG_W,       // scroll left by exactly one half of the double-wide group
        duration: 9,
        ease: 'none',
        repeat: -1,
        onUpdate() {
          // Direct SVG translate keeps values in user-units (seamless at any display scale)
          (waveEl as SVGElement).setAttribute('transform', `translate(${waveX.val}, 0)`);
        },
      });
      this.tweens.push(t);
    }
  }

  private killAll(): void {
    this.tweens.forEach(t => t.kill());
    this.tweens = [];
  }

  onHoverStart(): void {
    this.tweens.forEach(t => gsap.to(t, { timeScale: 4, duration: 0.4 }));
  }

  onHoverEnd(): void {
    this.tweens.forEach(t => gsap.to(t, { timeScale: 1, duration: 0.8 }));
  }

  replay(): void {
    this.killAll();
    this.sunAngle.val = 0;
    this.waveX.val = 0;
    setTimeout(() => {
      this.entrance();
      this.startAnimations();
    }, 50);
  }

  ngOnDestroy(): void {
    this.killAll();
  }
}
