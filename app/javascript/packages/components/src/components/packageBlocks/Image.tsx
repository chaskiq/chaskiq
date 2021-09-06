import React from 'react';
import styled from '@emotion/styled';
import tw from 'twin.macro';

type ImageContainerProps = {
  align?: 'left' | 'center' | 'right';
};

const ImageContainer = styled.div<ImageContainerProps>`
  ${(_props) => tw`flex`}
  ${(props) => {
    switch (props.align) {
      case 'left':
        return tw`justify-start`;
      case 'center':
        return tw`justify-center`;
      case 'right':
        return tw`justify-end`;
      default:
        return tw`justify-start`;
    }
  }};
`;

type ImageProps = {
  rounded?: boolean;
  styl: any;
};

const Image = styled.img<ImageProps>`
  ${(props) => (props.rounded ? tw`rounded-full` : '')}
`;

export function ImageRenderer({ field }) {
  return (
    <ImageContainer align={field.align}>
      <Image
        src={field.url}
        // className={`${s} ${a} ${r}`}
        rounded={field.rounded}
        styl={field.style}
        width={field.width}
        height={field.height}
      >
        {field.text}
      </Image>
    </ImageContainer>
  );
}
