import React from 'react';
import styled from '@emotion/styled';
import tw from 'twin.macro';
import { readableColor } from 'polished';

type ThemeType = {
  theme: any;
};

type SizeType = {
  size?: 'sm' | null;
};

type AlignType = {
  align?: 'left' | 'center' | 'right' | 'justify';
};

export function textColor(color) {
  const lightReturnColor = '#000';
  const darkReturnColor = '#fff';
  return readableColor(color, lightReturnColor, darkReturnColor, true);
}

export const RendererWrapper = styled.div`
  ${tw`w-full`}
`;

export const ErrorMessage = styled.span`
  ${() => tw`text-red-500 mb-2 text-sm`}
`;

export const Label = styled.label<ThemeType>`
  ${() => tw`block text-gray-700 dark:text-gray-200 font-bold mb-2`}
  ${(props) => (props.theme.size === 'sm' ? tw`text-xs` : tw`text-sm`)}
`;

export const HelperText = styled.div`
  ${() => tw`mt-2 text-xs text-gray-500 dark:text-gray-200`}
`;

export const Padder = styled.div<SizeType & AlignType & ThemeType>`
  ${(props) => (props.theme.size === 'sm' ? tw`mx-2 my-2` : tw`mx-4 my-2`)};

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

export function FormField({ name, label, helperText, children }) {
  return (
    <React.Fragment>
      <Label htmlFor={name}>{label}</Label>

      {children}

      {helperText && <HelperText>{helperText}</HelperText>}
    </React.Fragment>
  );
}
