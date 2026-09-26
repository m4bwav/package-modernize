'use strict';

/**
 * Pad the start of `text` with `filler` until it is at least `length` characters long.
 * Keeps 1.x behaviour exactly: the whole filler is prepended each time, so a multi-character filler can overshoot.
 * @param {unknown} text
 * @param {number} length
 * @param {unknown} [filler=' ']
 * @returns {string}
 */
function padLite(text, length, filler = ' ') {
  let result = String(text);
  const piece = String(filler);
  if (piece === '') {
    return result;
  }

  while (result.length < length) {
    result = piece + result;
  }

  return result;
}

module.exports = padLite;
