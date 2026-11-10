import { useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties } from 'react';

export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReduced(media.matches);
    sync();
    media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, []);
  return reduced;
}

export function useFinePointer() {
  const [fine, setFine] = useState(false);
  useEffect(() => {
    const media = window.matchMedia('(hover: hover) and (pointer: fine)');
    const sync = () => setFine(media.matches);
    sync();
    media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, []);
  return fine;
}

/** Reveals [data-reveal] nodes as they scroll into view, including ones mounted later. */
export function useReveal(dep: string) {
  useEffect(() => {
    if (!('IntersectionObserver' in window)) {
      document.querySelectorAll('[data-reveal]').forEach((node) => node.classList.add('is-visible'));
      return;
    }
    const seen = new WeakSet<Element>();
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    const watch = () => {
      document.querySelectorAll<HTMLElement>('[data-reveal]').forEach((node) => {
        if (seen.has(node)) return;
        seen.add(node);
        observer.observe(node);
      });
    };
    watch();
    /* Lists and tab panels mount after the route renders, so they need re-scanning. */
    let timer = 0;
    const mutations = new MutationObserver(() => {
      if (timer) return;
      timer = window.setTimeout(() => { timer = 0; watch(); }, 120);
    });
    mutations.observe(document.body, { childList: true, subtree: true });
    return () => {
      if (timer) window.clearTimeout(timer);
      mutations.disconnect();
      observer.disconnect();
    };
  }, [dep]);
}

/** Pointer-driven 3D tilt, written to the node as --tilt-x / --tilt-y. */
export function useTilt(dep: string) {
  const reduced = usePrefersReducedMotion();
  const fine = useFinePointer();
  useEffect(() => {
    if (reduced || !fine) return;
    const nodes = Array.from(document.querySelectorAll<HTMLElement>('[data-tilt]'));
    const offs = nodes.map((node) => {
      const move = (event: PointerEvent) => {
        const box = node.getBoundingClientRect();
        const dx = (event.clientX - box.left) / box.width - 0.5;
        const dy = (event.clientY - box.top) / box.height - 0.5;
        node.style.setProperty('--tilt-x', `${(dy * -4).toFixed(2)}deg`);
        node.style.setProperty('--tilt-y', `${(dx * 4).toFixed(2)}deg`);
      };
      const reset = () => {
        node.style.setProperty('--tilt-x', '0deg');
        node.style.setProperty('--tilt-y', '0deg');
      };
      node.addEventListener('pointermove', move);
      node.addEventListener('pointerleave', reset);
      return () => {
        node.removeEventListener('pointermove', move);
        node.removeEventListener('pointerleave', reset);
      };
    });
    return () => offs.forEach((off) => off());
  }, [dep, reduced, fine]);
}

/** Pointer parallax: the layer shifts by `depth` px inside the host. */
export function useParallax(depth: number) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const layerRef = useRef<HTMLDivElement | null>(null);
  const reduced = usePrefersReducedMotion();
  const fine = useFinePointer();

  useEffect(() => {
    const host = hostRef.current;
    const layer = layerRef.current;
    if (!host || !layer || reduced || !fine) return;
    let frame = 0;
    const move = (event: PointerEvent) => {
      const box = host.getBoundingClientRect();
      const dx = (event.clientX - box.left) / box.width - 0.5;
      const dy = (event.clientY - box.top) / box.height - 0.5;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        layer.style.setProperty('--px', `${(dx * depth).toFixed(1)}px`);
        layer.style.setProperty('--py', `${(dy * depth).toFixed(1)}px`);
      });
    };
    const leave = () => {
      cancelAnimationFrame(frame);
      layer.style.setProperty('--px', '0px');
      layer.style.setProperty('--py', '0px');
    };
    host.addEventListener('pointermove', move);
    host.addEventListener('pointerleave', leave);
    return () => {
      cancelAnimationFrame(frame);
      host.removeEventListener('pointermove', move);
      host.removeEventListener('pointerleave', leave);
    };
  }, [depth, reduced, fine]);

  return { hostRef, layerRef };
}

/** Counts up to `target` the first time the element is seen. */
export function useCountUp(target: number, options: { duration?: number; decimals?: number } = {}) {
  const { duration = 1400, decimals = 0 } = options;
  const ref = useRef<HTMLSpanElement | null>(null);
  const [value, setValue] = useState(0);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (reduced || !('IntersectionObserver' in window)) { setValue(target); return; }
    let raf = 0;
    let start = 0;
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      observer.disconnect();
      const step = (now: number) => {
        if (!start) start = now;
        const progress = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - progress, 3);
        setValue(target * eased);
        if (progress < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    }, { threshold: 0.4 });
    observer.observe(node);
    return () => { observer.disconnect(); cancelAnimationFrame(raf); };
  }, [target, duration, decimals, reduced]);

  const display = decimals ? value.toFixed(decimals) : Math.round(value).toLocaleString();
  return { ref, display };
}

/** Staggered reveal delay for grid children. */
export function useStagger(index: number, step = 70) {
  return useMemo(() => ({ '--reveal-delay': `${index * step}ms` }) as CSSProperties, [index, step]);
}
