import { Fragment, useRef, useState } from 'react'
import { motion, useInView, useReducedMotion } from 'motion/react'

type AnimatedTextProps = {
  text: string
  className?: string
}

export function AnimatedText({ text, className = '' }: AnimatedTextProps) {
  const headingRef = useRef<HTMLHeadingElement>(null)
  const inView = useInView(headingRef, { once: true, margin: '-10%' })
  const reduceMotion = useReducedMotion()
  const [replay, setReplay] = useState(0)
  const middle = (Array.from(text).filter((character) => character !== ' ' && character !== '\n').length - 1) / 2
  let characterIndex = 0

  return (
    <h2
      ref={headingRef}
      className={`animated-text ${className}`}
      aria-label={text.replace(/\s*\n\s*/g, ' ')}
      onMouseEnter={() => { if (!reduceMotion && inView) setReplay((current) => current + 1) }}
    >
      {text.split('\n').map((line, lineIndex) => (
        <span className="animated-text__line" aria-hidden="true" key={`${lineIndex}-${line}`}>
          {line.split(' ').map((word, wordIndex, words) => (
            <Fragment key={`${wordIndex}-${word}`}>
              <span className="animated-text__word">
                {Array.from(word).map((character) => {
                  const index = characterIndex++
                  const delay = Math.abs(index - middle) * 0.038
                  return (
                    <span className="animated-text__character" key={`${index}-${character}`}>
                      <span className="animated-text__measure">{character}</span>
                      <motion.span
                        key={`${replay}-${index}`}
                        className={`animated-text__glyph ${character === '.' ? 'animated-text__period' : ''}`}
                        initial={reduceMotion ? false : { fontWeight: 400, opacity: 0.56 }}
                        animate={inView || reduceMotion ? { fontWeight: 700, opacity: 1 } : undefined}
                        transition={{ duration: reduceMotion ? 0 : 0.7, delay: reduceMotion ? 0 : delay, ease: [0.22, 1, 0.36, 1] }}
                      >
                        {character}
                      </motion.span>
                    </span>
                  )
                })}
              </span>
              {wordIndex < words.length - 1 ? ' ' : null}
            </Fragment>
          ))}
        </span>
      ))}
    </h2>
  )
}
