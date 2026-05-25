// Scene runner: rAF loop, virtual grid → <pre>.
// Handles play/pause via IntersectionObserver/hover, reduced-motion fallback.
import { Grid } from './grid.js';

export function createPlayer(preEl, scene, opts = {}) {
  const grid = new Grid(scene.cols, scene.rows);
  let raf = null;
  let startTs = null;
  let running = false;
  let elapsed = 0;
  const { onComplete } = opts;
  const reducedMotion =
    opts.reducedMotion ??
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function renderStatic() {
    grid.clear();
    // Render final phase (t = duration) for reduced motion
    scene.draw(grid, scene.duration);
    preEl.textContent = grid.render();
  }

  function frame(ts) {
    if (!running) return;
    if (!startTs) startTs = ts - elapsed * 1000;
    const t = (ts - startTs) / 1000;
    elapsed = t;
    grid.clear();
    scene.draw(grid, Math.min(t, scene.duration));
    preEl.textContent = grid.render();
    if (t < scene.duration) {
      raf = requestAnimationFrame(frame);
    } else if (scene.loop) {
      startTs = ts;
      elapsed = 0;
      raf = requestAnimationFrame(frame);
    } else {
      running = false;
      console.log('[tl] animation DONE, onComplete type: ' + typeof onComplete);
      if (typeof onComplete === 'function') onComplete();
    }
  }

  function play() {
    if (reducedMotion) {
      renderStatic();
      return;
    }
    if (running) return;
    running = true;
    startTs = null;
    elapsed = 0;
    raf = requestAnimationFrame(frame);
  }

  function pause() {
    console.log('[tl] pause() called stack:', new Error().stack.split('\n').slice(1,4).join(' | '));
    running = false;
    if (raf) cancelAnimationFrame(raf);
  }

  function replay() {
    pause();
    elapsed = 0;
    play();
  }

  if (reducedMotion) renderStatic();

  return { play, pause, replay, grid };
}

// Hook a player to a container: autoplay on viewport enter, replay on hover.
export function attachAuto(container, player) {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) player.play();
        else player.pause();
      });
    },
    { threshold: 0.2 }
  );
  io.observe(container);
  container.addEventListener('mouseenter', () => player.replay());
  return () => {
    io.disconnect();
    player.pause();
  };
}
