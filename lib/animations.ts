/**
 * GSAP animation utilities for the application
 */

import gsap from 'gsap';

/**
 * Animate view transitions (e.g., switching between day/week/month views)
 */
export function viewTransition(element: HTMLElement | null) {
  if (!element) return;

  gsap.from(element, {
    duration: 0.2,
    opacity: 0,
    y: 10,
  });
}

/**
 * Stagger enter animation for list items
 * Used in: CommandPalette, TaskCard lists, etc.
 */
export const staggerEnter = () => ({
  duration: 0.3,
  delay: gsap.utils.unitize((i) => i * 0.05),
  opacity: 1,
  y: 0,
  stagger: 0.05,
});

/**
 * Fade in animation
 */
export const fadeIn = {
  duration: 0.2,
  opacity: 1,
};

/**
 * Fade out animation
 */
export const fadeOut = {
  duration: 0.2,
  opacity: 0,
};

/**
 * Scale up animation (for modals, etc.)
 */
export const scaleUp = {
  duration: 0.3,
  scale: 1,
  opacity: 1,
};

/**
 * Slide up animation
 */
export const slideUp = {
  duration: 0.3,
  y: 0,
  opacity: 1,
};

/**
 * Bounce animation (for interactive elements)
 */
export const bounce = {
  duration: 0.5,
  y: -5,
  ease: 'power2.out',
};

/**
 * Card enter animation for TaskCard
 */
export function cardEnter(element: HTMLElement | null) {
  if (!element) return;
  element.style.opacity = '0';
  element.style.transform = 'translateY(12px)';
  gsap.to(element, { duration: 0.3, opacity: 1, y: 0, ease: 'power2.out' });
}

/**
 * List item enter animation for TaskListItem
 */
export function listItemEnter(element: HTMLElement | null) {
  if (!element) return;
  gsap.from(element, { duration: 0.25, opacity: 0, x: -8, ease: 'power2.out' });
}

/**
 * Modal enter animation for modals
 */
export function modalEnter(element: HTMLElement | null) {
  if (!element) return;
  gsap.from(element, { duration: 0.3, opacity: 0, scale: 0.96, ease: 'power2.out' });
}

/**
 * Animate element entrance
 */
export function animateEnter(
  element: HTMLElement | null,
  options: gsap.TweenVars = {}
) {
  if (!element) return;
  gsap.from(element, {
    duration: 0.3,
    opacity: 0,
    y: 10,
    ...options,
  });
}

/**
 * Animate element exit
 */
export function animateExit(
  element: HTMLElement | null,
  options: gsap.TweenVars = {}
) {
  if (!element) return;
  return gsap.to(element, {
    duration: 0.2,
    opacity: 0,
    y: -10,
    ...options,
  });
}
