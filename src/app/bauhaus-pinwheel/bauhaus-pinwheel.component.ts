import { Component, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import gsap from 'gsap';

const GREY = '#D4CCB8';
const YELLOW = '#E8A218';
const BLACK = '#1A1A1A';
const BLUE = '#4B7FC4';
const RED = '#E05030';

@Component({
  selector: 'app-bauhaus-pinwheel',
  standalone: true,
  templateUrl: './bauhaus-pinwheel.component.html',
  styleUrls: ['./bauhaus-pinwheel.component.scss'],
})
export class BauhausPinwheelComponent implements AfterViewInit, OnDestroy {
  readonly grey = GREY;
  readonly yellow = YELLOW;
  readonly black = BLACK;
  readonly blue = BLUE;
  readonly red = RED;

  private tweens: gsap.core.Tween[] = [];

  constructor(private el: ElementRef) {}

  ngAfterViewInit(): void {
    this.playEntrance();
    this.startIdle();
  }

  private playEntrance(): void {
    const host: Element = this.el.nativeElement;
    const wrappers = host.querySelectorAll('.pin-wrapper');

    gsap.from(wrappers, {
      scale: 0,
      opacity: 0,
      duration: 0.7,
      ease: 'back.out(1.6)',
      stagger: { from: 'start', amount: 1.0 },
    });
  }

  private startIdle(): void {
    const host: Element = this.el.nativeElement;
    const wrappers = host.querySelectorAll('.pin-wrapper');

    wrappers.forEach((wrapper: Element, i: number) => {
      const duration = 10 + i * 3.5;
      const direction = i % 2 === 0 ? 360 : -360;

      const rot = gsap.to(wrapper, {
        rotation: `+=${direction}`,
        duration,
        ease: 'none',
        repeat: -1,
      });
      this.tweens.push(rot);

      const scale = gsap.to(wrapper, {
        scale: 0.82 + (i % 3) * 0.07,
        duration: 2.5 + i * 0.8,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
        delay: i * 0.4,
      });
      this.tweens.push(scale);
    });
  }

  private killAll(): void {
    this.tweens.forEach(t => t.kill());
    this.tweens = [];
  }

  onEnter(index: number): void {
    const tween = this.tweens[index * 2]; // rotation tween is every even slot
    if (tween) gsap.to(tween, { timeScale: 6, duration: 0.3 });
  }

  onLeave(index: number): void {
    const tween = this.tweens[index * 2];
    if (tween) gsap.to(tween, { timeScale: 1, duration: 0.6 });
  }

  replay(): void {
    this.killAll();
    this.playEntrance();
    this.startIdle();
  }

  ngOnDestroy(): void {
    this.killAll();
  }
}
