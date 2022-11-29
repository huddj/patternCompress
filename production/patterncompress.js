const partialASCII = [...[...Array(94).keys()].map(i => String.fromCharCode(i + 33)), ...[...Array(11).keys()].map(i => String.fromCharCode(i + 161)), ...[...Array(80).keys()].map(i => String.fromCharCode(i + 174))];
function getPatternValue(text, pattern) {
  let place = text.indexOf(pattern);
  if (-1 === place) {
    return {
      value: -(pattern.length + 2),
      occurences: 0
    };
  }
  let occurences = 0;
  while (0 <= place) {
    place = text.indexOf(pattern, place + pattern.length);
    occurences++;
  }
  return {
    value: occurences * (pattern.length - 1) - (pattern.length + 2),
    occurences: occurences
  };
}
function findBestPattern(text) {
  let length = 2;
  const patterns = [];
  const patternCache = new Map();
  const getPatternValueCached = pattern => {
    if (patternCache.has(pattern)) {
      return patternCache.get(pattern);
    } else {
      const value = getPatternValue(text, pattern);
      patternCache.set(pattern, value);
      return value;
    }
  };
  let maxValue = 0;
  for (let i = 0; i < text.length - 1; i++) {
    const pattern = text.substring(i, i + length);
    const pVal = getPatternValueCached(pattern);
    if (1 < pVal.occurences) {
      patterns.push({
        pattern: pattern,
        location: i,
        value: pVal.value,
        grow: true
      });
      maxValue = maxValue < pVal.value ? pVal.value : maxValue;
    }
  }
  let improvement = true;
  let iterations = 0;
  while (improvement && length < 20) {
    length++;
    improvement = false;
    for (let i = 0; i < patterns.length; i++) {
      iterations++;
      const p = patterns[i];
      if (!p.grow) {
        continue;
      }
      const pattern = text.substring(p.location, p.location + length);
      const pVal = getPatternValueCached(pattern);
      maxValue = maxValue < pVal.value ? pVal.value : maxValue;
      if (p.value <= pVal.value && 1 < pVal.occurences) {
        patterns[i] = {
          pattern: pattern,
          location: p.location,
          value: pVal.value,
          grow: true
        };
        improvement = true;
      } else if (pVal.value < p.value) {
        if (p.value < maxValue) {
          patterns.splice(i, 1);
          i--;
        } else {
          p.grow = false;
        }
      }
    }
  }
  return patterns.reduce((p, c) => p.value < c.value ? c : p, {
    pattern: "default",
    location: 0,
    value: -1
  }).pattern;
}
function patternCompress(text) {
  const unusedASCII = partialASCII.filter(c => !text.includes(c));
  let bestPattern;
  const patterns = [];
  while (0 < getPatternValue(text, bestPattern = findBestPattern(text)).value && 1 < unusedASCII.length) {
    const pattern = {
      char: unusedASCII.shift(),
      pattern: bestPattern,
      value: getPatternValue(text, bestPattern).value
    };
    patterns.push(pattern);
    text = text.replaceAll(pattern.pattern, pattern.char);
  }
  const bC = unusedASCII.shift();
  const result = bC + patterns.map(p => p.char + p.pattern).join(bC) + bC + bC + text;
  return {
    text: result,
    patterns: patterns
  };
}
function patternDecompress(text) {
  const bC = text.charAt(0);
  const patterns = text.substring(1, text.indexOf(bC + bC)).split(bC);
  let content = text.substring(text.indexOf(bC + bC, 1) + 2);
  patterns.reverse().forEach(p => {
    content = content.replaceAll(p.charAt(0), p.substring(1));
  });
  return content;
}
window.addEventListener("load", () => {
  const input = document.getElementById("input");
  const inputLength = document.getElementById("inputLength");
  const output = document.getElementById("output");
  const outputLength = document.getElementById("outputLength");
  const compress = document.getElementById("compress");
  const decompress = document.getElementById("decompress");
  compress.addEventListener("click", e => {
    inputLength.textContent = "length: " + input.value.length + " characters";
    output.value = patternCompress(input.value).text;
    outputLength.textContent = "length: " + output.value.length + " characters";
  });
  decompress.addEventListener("click", e => {
    inputLength.textContent = "length: " + input.value.length + " characters";
    output.value = patternDecompress(input.value);
    outputLength.textContent = "length: " + output.value.length + " characters";
  });
});