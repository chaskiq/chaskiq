import BaseButton from '../Button';
import styled from '@emotion/styled';
import tw from 'twin.macro';
import { textColor } from './shared';
import { darken, lighten } from 'polished';

type ButtonWrapperProps = {
  align?: 'left' | 'center' | 'right';
};

export const ButtonWrapper = styled.div<ButtonWrapperProps>`
  ${(props) => {
    switch (props.align) {
      case 'left':
        return tw`flex justify-start`;
      case 'center':
        return tw`flex justify-center`;
      case 'right':
        return tw`flex justify-end`;
      default:
        return '';
    }
  }};
`;

type ButtonProps = {
  id?: string;
  disabled?: boolean;
  align?: 'left' | 'center' | 'right';
  width?: 'full';
  theme: {
    palette: {
      primary: string;
    };
  };
  variant?: 'success' | 'main' | 'clean' | 'outlined' | 'danger' | 'link';
};

export const Button = styled(BaseButton)<ButtonProps>`
  ${(props) =>
    !props.variant && props.theme && props.theme.palette && !props.disabled
      ? `
    background-color: ${props.theme.palette.primary} !important;
    color: ${textColor(props.theme.palette.primary)} !important;
    border-color: ${props.theme.palette.primary} !important;
    &:hover{
      background-color: ${lighten(0.1, props.theme.palette.primary)} !important;
      color: ${textColor(props.theme.palette.primary)} !important;  
    }
    `
      : ''}

  display: block;

  ${(props) =>
    props.disabled
      ? tw`bg-gray-200 text-gray-300 hover:bg-gray-200 hover:text-gray-300 cursor-auto`
      : ''}

  ${(props) => {
    switch (props.align) {
      case 'left':
        return tw`self-start`;
      case 'center':
        return tw`self-center text-center`;
      case 'right':
        return tw`self-end`;
      default:
        return '';
    }
  }};

  ${(props) => {
    switch (props.width) {
      case 'full':
        return tw`w-full text-center`;
      default:
        return '';
    }
  }}

  ${(props) => {
    switch (props.variant) {
      case 'success':
        return '';
      case 'main':
        return '';
      case 'clean':
        return '';
      case 'outlined':
        return `
          ${(props) =>
            props.theme.palette
              ? `
            border-color: ${props.theme.palette.primary} !important;
          `
              : `
            border-color: "#ccc" !important;
          `}
        `;
      case 'danger':
        return '';
      case 'link':
        return `
        ${(_props) =>
          tw`text-sm leading-5 font-bold text-gray-900 hover:text-indigo-500`}
        ${(props) => (props.theme.palette ? '' : '')}
      `;

      default:
        return `
          ${(props) =>
            props.theme.palette
              ? `
            background-color: ${props.theme.palette.primary} !important;
            color: ${textColor(props.theme.palette.primary)} !important;
            border: none !important;
            &:hover{
              background-color: ${darken(
                0.1,
                props.theme.palette.primary
              )} !important;
              color: ${textColor(props.theme.palette.primary)} !important;
              border: none !important;
            }`
              : ''}
        `;
    }
  }};
`;
