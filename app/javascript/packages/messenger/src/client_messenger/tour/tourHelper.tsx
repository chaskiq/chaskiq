import React from 'react';
import { Navigation, Dot, Controls, Arrow } from 'reactour-emotion';
import styled from '@emotion/styled';
import tw from 'twin.macro';

const Wrapper = styled.div`
  ${tw`p-3 rounded-md shadow-md bg-white`};
  max-width: 300px;
`;

const Content = styled.div`
  ${tw`text-sm font-display overflow-auto`};
  a {
    ${tw`text-blue-600 hover:text-blue-600 visited:text-purple-600 underline`};
  }
  max-height: 300px;

  .graf.graf--h3 {
    ${tw`mt-2`};
  }
`;

const ContentWrapper = styled.div``;

const StepBadge = styled.div`
  ${tw`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800`};
`;

export default function MyCustomHelper({
  current,
  content,
  totalSteps,
  gotoStep,
}) {
  return (
    <Wrapper>
      <aside className="CustomHelper__sidebar">
        <StepBadge>
          Step {current + 1} / {totalSteps}
        </StepBadge>
      </aside>
      <ContentWrapper>
        <Content>{content}</Content>
        <Controls
          data-tour-elem="controls"
          className="CustomHelper__controls"
          //style={{ position: 'absolute' }}
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
      </ContentWrapper>
    </Wrapper>
  );
}
