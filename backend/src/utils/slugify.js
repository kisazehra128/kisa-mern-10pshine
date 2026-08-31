function slugify(name) {
  const collapsed = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-');

  let start = 0;
  while (start < collapsed.length && collapsed[start] === '-') {
    start += 1;
  }

  let end = collapsed.length;
  while (end > start && collapsed[end - 1] === '-') {
    end -= 1;
  }

  return collapsed.slice(start, end).slice(0, 40);
}

module.exports = slugify;
