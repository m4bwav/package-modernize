'use strict';

/**
 * Pad the start of `text` with `filler` until it is `length` characters long.
 * @param {unknown} text
 * @param {number} length
 * @param {unknown} [filler=' ']
 * @returns {string}
 */
function padLite(text, length, filler = ' ') {
  return String(text).padStart(length, String(filler));
}

module.exports = padLite;
