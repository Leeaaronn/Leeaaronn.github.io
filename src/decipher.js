/**
 * Decipher/decode text animation — characters start as random data glyphs
 * and rapidly cycle before "locking in" left-to-right.
 */

const GLYPHS = '0123456789ABCDEF@#$%&*!?<>{}[]';
const randomGlyph = () => GLYPHS[Math.floor(Math.random() * GLYPHS.length)];

/**
 * Pick charDelay based on text length for comfortable reading speed.
 *   < 20 chars → 70ms (slow, dramatic)
 *  20-60 chars → 50ms
 *   > 60 chars → 30ms (faster for paragraphs)
 */
function autoCharDelay(charCount) {
  if (charCount < 20) return 70;
  if (charCount <= 60) return 50;
  return 30;
}

/**
 * Animate a single text node with the decipher effect.
 * @returns {Promise} resolves when animation completes
 */
function animateTextNode(textNode, { charDelay = 70, cycleSpeed = 90, startDelay = 0 } = {}) {
  const original = textNode.textContent;
  const chars = [...original];
  const locked = new Array(chars.length).fill(false);
  let nextLockIndex = 0;

  return new Promise((resolve) => {
    setTimeout(() => {
      textNode.textContent = chars.map((c) => (c === ' ' || c === '\n') ? c : randomGlyph()).join('');

      let cycleCount = 0;
      const lockEvery = Math.max(1, Math.round(charDelay / cycleSpeed));

      const interval = setInterval(() => {
        cycleCount++;

        if (cycleCount % lockEvery === 0 && nextLockIndex < chars.length) {
          while (nextLockIndex < chars.length && (chars[nextLockIndex] === ' ' || chars[nextLockIndex] === '\n')) {
            locked[nextLockIndex] = true;
            nextLockIndex++;
          }
          if (nextLockIndex < chars.length) {
            locked[nextLockIndex] = true;
            nextLockIndex++;
          }
        }

        const display = chars.map((c, i) => {
          if (locked[i]) return c;
          if (c === ' ' || c === '\n') return c;
          return randomGlyph();
        }).join('');

        textNode.textContent = display;

        if (nextLockIndex >= chars.length) {
          clearInterval(interval);
          textNode.textContent = original;
          resolve();
        }
      }, cycleSpeed);
    }, startDelay);
  });
}

/**
 * Collect all text nodes within an element (depth-first).
 */
function getTextNodes(el) {
  const nodes = [];
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
  let node;
  while ((node = walker.nextNode())) {
    if (node.textContent.trim().length > 0) {
      nodes.push(node);
    }
  }
  return nodes;
}

/**
 * Apply decipher animation to an element.
 *
 * @param {HTMLElement} element
 * @param {Object} [options]
 * @param {number} [options.charDelay] - auto-scaled if omitted
 * @param {number} [options.cycleSpeed=90]
 * @param {Function} [options.onStart] - called when this element begins deciphering
 * @param {Function} [options.onComplete] - called when this element finishes deciphering
 */
export function decipherText(element, options = {}) {
  const textNodes = getTextNodes(element);

  const totalChars = textNodes.reduce((sum, n) => sum + n.textContent.replace(/\s/g, '').length, 0);
  const charDelay = options.charDelay || autoCharDelay(totalChars);
  const cycleSpeed = options.cycleSpeed || 90;

  if (options.onStart) options.onStart();

  let cumulativeChars = 0;
  const promises = textNodes.map((node) => {
    const startDelay = cumulativeChars * charDelay * 0.25;
    cumulativeChars += node.textContent.replace(/\s/g, '').length;
    return animateTextNode(node, { charDelay, cycleSpeed, startDelay });
  });

  return Promise.all(promises).then(() => {
    if (options.onComplete) options.onComplete();
  });
}

/**
 * Apply decipher to every element in a NodeList/array, staggered slightly.
 */
export function decipherAll(elements, options = {}) {
  const stagger = options.stagger || 80;
  const els = Array.from(elements);

  els.forEach((el, i) => {
    setTimeout(() => decipherText(el, options), i * stagger);
  });
}

/**
 * Set up IntersectionObserver to trigger decipher on element(s) once.
 */
export function decipherOnReveal(root, targets, options = {}) {
  if (!root) return;

  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        observer.disconnect();
        if (targets instanceof HTMLElement) {
          decipherText(targets, options);
        } else {
          decipherAll(targets, options);
        }
      }
    }
  }, { threshold: 0.2 });

  observer.observe(root);
}
