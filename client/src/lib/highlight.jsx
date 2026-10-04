// <Highlight text="Prépa analysis" query="prepa" /> → "<mark>Prépa</mark> analysis"
// Safe: builds React elements (never HTML strings). Ignores case and accents, and highlights
// every word of the query (2+ letters) wherever it appears.

import { Fragment } from 'react'
import { normalise } from './text.js'

// Character ranges [start, end) of `text` that match one of the query words
function matchRanges(text, query) {
  const words = normalise(query)
    .split(/\s+/)
    .filter((w) => w.length >= 2)
  if (!words.length) return []

  // Normalise char by char, remembering where each normalised char came from,
  // so a match found in the plain text maps back to the original (accented) text
  let plain = ''
  const from = []
  ;[...text].forEach((ch, i) => {
    for (const c of normalise(ch)) {
      plain += c
      from.push(i)
    }
  })
  const chars = [...text]

  const marked = new Array(chars.length).fill(false)
  for (const word of words) {
    let at = plain.indexOf(word)
    while (at !== -1) {
      for (let k = at; k < at + word.length; k++) marked[from[k]] = true
      at = plain.indexOf(word, at + word.length)
    }
  }

  const ranges = []
  marked.forEach((on, i) => {
    if (!on) return
    const last = ranges.at(-1)
    if (last && last[1] === i) last[1] = i + 1
    else ranges.push([i, i + 1])
  })
  return ranges
}

export default function Highlight({ text, query }) {
  const ranges = query ? matchRanges(text, query) : []
  if (!ranges.length) return text

  const chars = [...text]
  const parts = []
  let pos = 0
  ranges.forEach(([start, end], i) => {
    if (start > pos) parts.push(<Fragment key={`t${i}`}>{chars.slice(pos, start).join('')}</Fragment>)
    parts.push(
      <mark key={`m${i}`} className="rounded-sm bg-highlight-soft px-0.5 text-inherit">
        {chars.slice(start, end).join('')}
      </mark>,
    )
    pos = end
  })
  if (pos < chars.length) parts.push(<Fragment key="end">{chars.slice(pos).join('')}</Fragment>)
  return parts
}
