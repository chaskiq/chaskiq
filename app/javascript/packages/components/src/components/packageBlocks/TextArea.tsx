import React from 'react';
import styled from '@emotion/styled';
import { HelperText, Label } from './shared';
import tw from 'twin.macro';

function FormField({ name, label, helperText, children }) {
  return (
    <React.Fragment>
      <Label htmlFor={name}>{label}</Label>

      {children}

      {helperText && <HelperText>{helperText}</HelperText>}
    </React.Fragment>
  );
}

type TextAreaType = {
  error: any;
};

const TextArea = styled.div<TextAreaType>`
  ${() => tw`flex flex-col`}

  label {
    ${(props) => (props.error ? tw`text-red-500` : '')}
  }

  textarea {
    ${(props) =>
      props.error
        ? tw`border-red-500 text-red-500 bg-red-100`
        : 'text-gray-700'}

    ${() => tw`shadow appearance-none border 
      rounded w-full py-2 px-3
      leading-tight focus:outline-none focus:shadow-outline`}
  }
`;

type TextAreaFieldType = {
  id: string;
  name: string;
  disabled?: boolean;
  loading?: boolean;
  errors?: any;
  label?: string;
  hint?: string;
  placeholder?: string;
  value?: string;
};

type TextAreaRendererType = {
  loading?: boolean;
  field: TextAreaFieldType;
};

export function TextAreaRenderer({ field, loading }: TextAreaRendererType) {
  return (
    <FormField name={field.name} label={field.label} helperText={field.hint}>
      <TextArea error={field.errors}>
        <textarea
          id={field.id}
          name={field.name || field.id}
          disabled={field.disabled || loading}
          placeholder={field.placeholder}
        >
          {field.value}
        </textarea>
      </TextArea>
    </FormField>
  );
}
