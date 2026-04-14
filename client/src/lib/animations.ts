import gsap from 'gsap';

export const cardEnter = (el: Element, delay = 0) =>
  gsap.fromTo(el, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.22, delay, ease: 'power2.out' });

export const listItemEnter = (el: Element, delay = 0) =>
  gsap.fromTo(el, { opacity: 0, x: -8 }, { opacity: 1, x: 0, duration: 0.22, delay, ease: 'power2.out' });

export const viewTransition = (el: Element) =>
  gsap.fromTo(el, { opacity: 0, y: 4 }, { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' });

export const modalEnter = (el: Element) =>
  gsap.fromTo(el, { opacity: 0, scale: 0.96 }, { opacity: 1, scale: 1, duration: 0.22, ease: 'power2.out' });

export const modalExit = (el: Element, onComplete: () => void) =>
  gsap.to(el, { opacity: 0, scale: 0.96, duration: 0.18, ease: 'power2.in', onComplete });

export const staggerEnter = (els: Element[]) =>
  gsap.fromTo(els, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.22, stagger: 0.05, ease: 'power2.out' });
