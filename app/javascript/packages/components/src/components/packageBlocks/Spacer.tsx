import React from 'react';
import styled from '@emotion/styled';
import tw from 'twin.macro';

type SpacerProps = {
  size?: 'xs' | 's' | 'm' | 'l' | 'xl';
};
const Spacer = styled.div<SpacerProps>`
  ${(props) => {
    switch (props.size) {
      case 'xs':
        return tw`h-1`;
      case 's':
        return tw`h-2`;
      case 'm':
        return tw`h-4`;
      case 'l':
        return tw`h-6`;
      case 'xl':
        return tw`h-8`;
      default:
        return 'h-1';
    }
  }};
`;

interface ISpacerRenderer {
  field: SpacerProps;
}

export function SpacerRenderer({ field }: ISpacerRenderer) {
  return <Spacer size={field.size} />;
}
