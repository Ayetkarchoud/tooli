// Tiny, safe formatter for tutor answers. It builds React elements (never HTML strings),
// so whatever the text contains is always shown as text.
//
// Supported:
//   blank-line / line breaks → paragraphs (single line breaks become <br>)
//   1. / 1) steps           → numbered list
//   - / * / • items         → bullet list
//   ```lang … ```            → code block
//   **bold**, `inline code` → inside any line

import { Fragment } from 'react'
import { motion } from 'motion/react'

const NUMBERED = /^\s*(\d+)[.)]\s+(.*)$/
const BULLET = /^\s*[-*•]\s+(.*)$/
const FENCE = /^\s*```(.*)$/

// Text → [{ type: 'p', lines } | { type: 'ol', start, items } | { type: 'ul', items } | { type: 'code', lang, code }]
function parseBlocks(text) {
  const lines = String(text ?? '').replace(/\r\n?/g, '\n').split('\n')
  const blocks = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]
    const fence = line.match(FENCE)

    if (fence) {
      const code = []
      i++
      while (i < lines.length && !FENCE.test(lines[i])) code.push(lines[i++])
      i++ // skip the closing fence (or the end of the text if it's missing)
      blocks.push({ type: 'code', lang: fence[1].trim(), code: code.join('\n') })
    } else if (NUMBERED.test(line)) {
      const start = Number(line.match(NUMBERED)[1])
      const items = []
      while (i < lines.length && NUMBERED.test(lines[i])) items.push(lines[i++].match(NUMBERED)[2])
      blocks.push({ type: 'ol', start, items })
    } else if (BULLET.test(line)) {
      const items = []
      while (i < lines.length && BULLET.test(lines[i])) items.push(lines[i++].match(BULLET)[1])
      blocks.push({ type: 'ul', items })
    } else if (!line.trim()) {
      i++
    } else {
      const paragraph = []
      while (i < lines.length && lines[i].trim() && !FENCE.test(lines[i]) && !NUMBERED.test(lines[i]) && !BULLET.test(lines[i])) {
        paragraph.push(lines[i++])
      }
      blocks.push({ type: 'p', lines: paragraph })
    }
  }
  return blocks
}

// **bold** and `code` inside one line
function Inline({ text }) {
  return text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>
    }
    if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
      return (
        <code key={i} className="rounded-sm bg-muted px-1.5 py-0.5 font-mono text-[0.88em]">
          {part.slice(1, -1)}
        </code>
      )
    }
    return <Fragment key={i}>{part}</Fragment>
  })
}

function Block({ block }) {
  switch (block.type) {
    case 'code':
      return (
        <pre className="overflow-x-auto rounded-lg border border-border bg-background p-3.5 text-[13px] leading-relaxed">
          <code className="font-mono" data-lang={block.lang || undefined}>
            {block.code}
          </code>
        </pre>
      )
    case 'ol':
      return (
        <ol start={block.start} className="list-decimal space-y-1.5 pl-6 marker:font-semibold marker:text-primary-text">
          {block.items.map((item, i) => (
            <li key={i} className="pl-1">
              <Inline text={item} />
            </li>
          ))}
        </ol>
      )
    case 'ul':
      return (
        <ul className="list-disc space-y-1.5 pl-6 marker:text-primary-text">
          {block.items.map((item, i) => (
            <li key={i} className="pl-1">
              <Inline text={item} />
            </li>
          ))}
        </ul>
      )
    default:
      return (
        <p>
          {block.lines.map((line, i) => (
            <Fragment key={i}>
              {i > 0 && <br />}
              <Inline text={line} />
            </Fragment>
          ))}
        </p>
      )
  }
}

const revealBlock = {
  hidden: { opacity: 0, y: 6 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
}

// `reveal`: blocks appear one after another (for a freshly arrived answer)
export default function FormattedText({ text, reveal = false }) {
  const blocks = parseBlocks(text)

  if (!reveal) {
    return (
      <div className="space-y-3 leading-relaxed">
        {blocks.map((block, i) => (
          <Block key={i} block={block} />
        ))}
      </div>
    )
  }

  return (
    <motion.div
      className="space-y-3 leading-relaxed"
      initial="hidden"
      animate="show"
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.12 } } }}
    >
      {blocks.map((block, i) => (
        <motion.div key={i} variants={revealBlock}>
          <Block block={block} />
        </motion.div>
      ))}
    </motion.div>
  )
}
