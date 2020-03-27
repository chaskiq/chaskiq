
import React from 'react'
import { 
  Navigation, 
  Dot, 
  Controls, 
  Arrow 
} from 'reactour-emotion'


export default function MyCustomHelper({ current, content, totalSteps, gotoStep, close }) {

  return (
    <main className="CustomHelper__wrapper">
      <aside className="CustomHelper__sidebar">
        <span className="CustomHelper__sidebar_step">
          Step {current + 1}
        </span>
        
        <span className="CustomHelper__sidebar_step">
          Lorem Ipsum
        </span>
      </aside>
      <div className="CustomHelper__content">
        {content}
        <Controls
          data-tour-elem="controls"
          className="CustomHelper__controls"
          style={{ position: 'absolute' }}
        >
          <Arrow
            onClick={() => gotoStep(current - 1)}
            disabled={current === 0}
            className="CustomHelper__navArrow"
          />
          <Navigation data-tour-elem="navigation">
            {Array.from(Array(totalSteps).keys()).map((li, i) => (
              <Dot
                key={li}
                onClick={() => current !== i && gotoStep(i)}
                current={current}
                index={i}
                disabled={current === i}
                showNumber={true}
                data-tour-elem="dot"
              />
            ))}
          </Navigation>
          <Arrow
            onClick={() => gotoStep(current + 1)}
            disabled={current === totalSteps - 1}
            className="CustomHelper__navArrow"
            inverted
          />
        </Controls>
      </div>
    </main>
  )
}