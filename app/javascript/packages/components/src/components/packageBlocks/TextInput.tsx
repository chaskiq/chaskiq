import React from 'react';
import styled from '@emotion/styled';
import tw from 'twin.macro';
import { Progress } from './styled';
import { ErrorMessage, textColor, FormField } from './shared';
import { lighten } from 'polished';

type FieldType = {
  action: boolean;
  save_state?: 'disabled' | 'failed';
};

type ThemeType = {
  size: 'sm';
  palette: {
    primary: string;
  };
};

type TextInputProps = {
  theme: ThemeType;
  field: FieldType;
  error?: any;
  disabled?: boolean;
};

export const TextInput = styled.input<TextInputProps>`
  ${() => tw`border relative shadow-sm block w-full`}

  ${(props) =>
    props.theme.size === 'sm'
      ? tw`p-1 text-sm`
      : tw`p-3 m-0 pr-10 focus:shadow-outline sm:text-sm sm:leading-5`}

  ${() =>
    tw`block w-full transition ease-in-out duration-150 sm:text-sm sm:leading-5`}

  ${(props) =>
    props.field.save_state === 'failed'
      ? tw`border-red-300 text-red-500 placeholder-red-300 bg-red-100 focus:border-red-300`
      : ''}

  ${(props) =>
    props.disabled && props.field.save_state === 'failed'
      ? tw`border-red-300 text-red-200 placeholder-red-300 bg-red-100 focus:border-red-300`
      : ''}

  ${(props) =>
    props.disabled && !props.field.save_state
      ? tw`dark:bg-gray-900 dark:text-gray-100 border-gray-300 text-gray-200 placeholder-gray-300 bg-gray-100 border-r-0 focus:border-gray-300`
      : ''}

  ${(props) =>
    !props.field.save_state && !props.error
      ? tw`dark:bg-gray-900 dark:text-gray-100 border-gray-300 text-gray-900 placeholder-gray-300 focus:border-gray-300`
      : ''}

  ${(props) =>
    !props.field.save_state && props.error
      ? tw`border-red-300 text-red-900 placeholder-red-300 focus:border-red-300`
      : ''}

  margin:0px !important;

  ${(props) =>
    props.field.action
      ? `border-top-right-radius: 0rem !important;
    border-bottom-right-radius: 0rem !important;`
      : ''}

  ${(props) =>
    props.disabled
      ? `background: #f6f4f4 !important;
    color: #525252 !important;`
      : ''}
`;

type TextInputWrapperProps = {
  shadow?: boolean;
  field: FieldType;
};

const TextInputWrapper = styled.div<TextInputWrapperProps>`
  ${(props) => (props.shadow ? tw`shadow-sm` : '')}

  ${(props) =>
    props.field.action ? tw`rounded-none rounded-l-md` : tw`rounded-none`}

  ${() => tw`flex relative`}
`;

type TextInputButtonProps = {
  disabled: boolean;
  saved: boolean;
  theme?: ThemeType;
};

const TextInputButton = styled.div<TextInputButtonProps>`
  ${(props) => (props.theme.size === 'sm' ? tw`px-1 py-1` : tw`px-5 py-3`)};

  ${() => tw`-ml-px relative inline-flex items-center
   text-sm leading-5 font-medium
   dark:bg-gray-900 dark:text-gray-200 
  rounded-r-md text-gray-700 bg-gray-100 hover:text-gray-500 
  transition ease-in-out duration-150`}

  ${(props) =>
    !props.disabled
      ? tw`hover:bg-white focus:outline-none focus:shadow-outline`
      : ''}


  ${(props) =>
    props.disabled
      ? `
      border: 1px solid #ccc;
      ${() =>
        tw`border border-gray-300 text-gray-200 bg-gray-100 hover:text-gray-200 hover:bg-gray-100`}
      ${() => tw`cursor-pointer`}

    `
      : props.theme && props.theme.palette
      ? `
      background-color: ${props.theme.palette.primary};
      color: ${textColor(props.theme.palette.primary)};
  
      &:focus {
        background-color: ${props.theme.palette.primary};
        color: ${textColor(props.theme.palette.primary)};
      }
      &:active {
        background-color: ${props.theme.palette.primary};
        color: ${textColor(props.theme.palette.primary)};
      }
  
      &:hover {
        background-color: ${lighten(0.1, props.theme.palette.primary)};
        color: ${textColor(props.theme.palette.primary)};
      }
      `
      : tw`bg-blue-700 
      hover:bg-blue-600 
      active:bg-gray-100 
      active:text-gray-700
      `}

  ${(props) =>
    !props.disabled
      ? tw`
  cursor-pointer
  focus:outline-none 
  focus:shadow-outline`
      : ''}

  svg {
    position: absolute;
    left: 4px;
    ${(props) => (props.saved ? tw`text-green-400` : tw`text-white`)}
  }

  ${(props) =>
    props.saved
      ? `
    position: absolute;
    right: 3px;
    top: -3px;
    display: block;
    border: 1px solid transparent;
    background: transparent;`
      : ''}
`;

const CheckIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path
      fillRule="evenodd"
      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
      clipRule="evenodd"
    />
  </svg>
);

const ArrowRight = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path
      fillRule="evenodd"
      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
      clipRule="evenodd"
    />
  </svg>
);

export function TextInputRenderer({ field, handleAction, loading, disabled }) {
  function isDisabled() {
    return (
      disabled || loading || field.disabled || field.save_state === 'saved'
    );
  }

  function isSaved() {
    return field.save_state === 'saved';
  }

  return (
    <FormField
      name={field.name || field.id}
      label={field.label}
      helperText={field.hint}
    >
      <TextInputWrapper field={field}>
        <TextInput
          field={field}
          error={field.errors}
          type="text"
          id={field.id}
          name={field.name || field.id}
          autoComplete="off"
          onKeyDown={(e) => {
            if (e.keyCode === 13) {
              e.preventDefault();
              handleAction(e, field);
            }
          }}
          disabled={isDisabled()}
          defaultValue={field.value || ''}
          placeholder={field.placeholder}
        />

        {!field.action && field.save_state === 'saved' && (
          <TextInputButton disabled={true} saved={true}>
            <CheckIcon />
          </TextInputButton>
        )}

        {field.action && (
          <TextInputButton
            onClick={(e) => {
              if (!isDisabled() && !isSaved()) handleAction(e, field);
            }}
            saved={field.save_state === 'saved'}
            disabled={isDisabled()}
          >
            {field.save_state === 'saved' ? (
              <CheckIcon />
            ) : loading ? (
              <Progress />
            ) : (
              <ArrowRight />
            )}
          </TextInputButton>
        )}
      </TextInputWrapper>
      {field.errors && (
        <ErrorMessage key={`error-for-${field.name}`} className="error">
          {field.errors}
        </ErrorMessage>
      )}
    </FormField>
  );
}
