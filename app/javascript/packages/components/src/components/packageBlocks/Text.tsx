import React from 'react';
import styled from '@emotion/styled';
import ReactMarkdown from 'react-markdown';
import tw from 'twin.macro';

type ParagraphType = {
  styl?:
    | 'header'
    | 'muted'
    | 'error'
    | 'notice'
    | 'notice-error'
    | 'notice-success';
  align: 'center' | 'left' | 'right' | 'justify';
};

const Paragraph = styled.div<ParagraphType>`
  p {
    font-size: inherit;
    font-weight: inherit;
    color: inherit;
    line-height: inherit;
  }

  ${(props) => {
    switch (props.styl) {
      case 'header':
        return tw`text-lg leading-8 font-bold text-gray-800 dark:text-gray-100`;
      case 'muted':
        return tw`text-sm leading-5 text-gray-500 dark:text-gray-300`;
      case 'error':
        return tw`text-sm leading-5 text-red-500`;
      case 'notice':
        return tw`p-2 bg-blue-50 text-blue-400 rounded-md text-xs`;
      case 'notice-error':
        return tw`p-2 bg-red-50 text-red-400 rounded-md text-xs`;
      case 'notice-success':
        return tw`p-2 bg-green-50 text-green-400 rounded-md text-xs`;
      default:
        return tw`text-sm`;
    }
  }};

  ${(props) => {
    switch (props.align) {
      case 'left':
        return tw`text-left`;
      case 'center':
        return tw`text-center`;
      case 'right':
        return tw`text-right`;
      case 'justify':
        return tw`text-justify`;
      default:
        return '';
    }
  }};
`;

export function TextRenderer({ field }) {
  return (
    <Paragraph align={field.align} styl={field.style}>
      {field.style === 'header' && <h3>{field.text}</h3>}

      {field.style !== 'header' && <ReactMarkdown>{field.text}</ReactMarkdown>}
    </Paragraph>
  );
}
