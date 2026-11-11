import { useEffect, useRef } from 'react';
import { useFinePointer, usePrefersReducedMotion } from '@/lib/motion';

/**
 * Desktop-only cursor: an exact dot plus a ring that trails it with easing
 * and reacts to what is underneath.
 * Touch, pen, and reduced-motion users keep their native cursor.
 */
export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);
  const reduced = usePrefersReducedMotion();
  const fine = useFinePointer();
  const enabled = fine && !reduced;

  useEffect(() => {
    if (!enabled) return;
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    const root = document.documentElement;
    root.classList.add('cursor-custom');

    const pointer = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const trail = { x: pointer.x, y: pointer.y };
    let mode = 'default';
    let pressed = false;
    let shown = false;
    let frame = 0;

    const show = (on: boolean) => {
      shown = on;
      dot.style.opacity = on ? '1' : '0';
      ring.style.opacity = on ? '1' : '0';
    };

    const readMode = (event: MouseEvent) => {
      const el = (event.target as HTMLElement | null)?.closest<HTMLElement>('a, button, [role="button"], input, select, textarea, label, [data-cursor]');
      if (!el) return 'default';
      if (el.matches('input:not([type="checkbox"]):not([type="radio"]), textarea, select, [contenteditable]')) return 'text';
      if (el.matches('[data-cursor="card"], .svc, .listing, .quote-card, .tile')) return 'card';
      if (el.matches('.btn, button')) return 'button';
      return 'link';
    };

    const onMove = (event: MouseEvent) => {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      if (!shown) {
        trail.x = pointer.x;
        trail.y = pointer.y;
        show(true);
      }

      const next = readMode(event);
      if (next !== mode) {
        mode = next;
        ring.dataset.mode = mode;
      }
    };

    const onOut = (event: MouseEvent) => { if (!event.relatedTarget) show(false); };
    const onHide = () => show(false);
    const onDown = () => { pressed = true; };
    const onUp = (event: PointerEvent) => {
      pressed = false;
      const ripple = document.createElement('span');
      ripple.className = 'cursor-ripple';
      ripple.style.left = `${event.clientX}px`;
      ripple.style.top = `${event.clientY}px`;
      document.body.appendChild(ripple);
      window.setTimeout(() => ripple.remove(), 600);
    };

    const tick = () => {
      trail.x += (pointer.x - trail.x) * 0.17;
      trail.y += (pointer.y - trail.y) * 0.17;
      dot.style.transform = `translate3d(${pointer.x}px, ${pointer.y}px, 0) translate(-50%, -50%)`;
      ring.style.transform = `translate3d(${trail.x}px, ${trail.y}px, 0) translate(-50%, -50%) scale(${pressed ? 0.82 : 1})`;
      frame = requestAnimationFrame(tick);
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('mouseout', onOut, { passive: true });
    window.addEventListener('blur', onHide);
    window.addEventListener('pointerdown', onDown);
    window.addEventListener('pointerup', onUp, { passive: true });
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      root.classList.remove('cursor-custom');
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseout', onOut);
      window.removeEventListener('blur', onHide);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
      document.querySelectorAll('.cursor-ripple').forEach((node) => node.remove());
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <>
      <div ref={dotRef} className="cursor-dot" data-cursor-lock aria-hidden="true" />
      <div ref={ringRef} className="cursor-ring" data-mode="default" aria-hidden="true" />
    </>
  );
}
