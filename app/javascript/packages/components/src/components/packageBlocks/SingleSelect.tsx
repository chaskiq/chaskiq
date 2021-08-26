import React from 'react';
import styled from '@emotion/styled';
import tw from 'twin.macro';

type AlignProps = {
  align?: 'center' | 'right';
  direction?: 'column';
};

export const SingleSelect = styled.div<AlignProps>`
  ${() => tw`flex flex-col`}
  ${(props) => {
    switch (props.align) {
      case 'center':
        return tw`items-center`;
      case 'right':
        return tw`items-end`;
      default:
        break;
    }
  }}

  .label {
    ${() => tw`py-2`}
  }

  .content {
    ${() => tw`inline-flex`}

    ${({ direction }) => {
      switch (direction) {
        case 'column':
          return tw`flex-col`;
        default:
          break;
      }
    }}
  }
`;

type SingleSelectButtonProps = {
  variant?: 'hovered' | 'bordered';
  field?: any;
  isDisabled?: boolean;
  isSaved?: boolean;
  isSelected?: boolean;
  isFailed?: boolean;
  i: number;
};

export const SingleSelectButton = styled.button<SingleSelectButtonProps>`
  ${() => tw`outline-none border font-light py-2 px-4`}

  ${(props) =>
    props.variant === 'hovered' &&
    tw`text-2xl border-0 transition delay-150 duration-200 ease-in-out transform hover:scale-125`}

  ${(props) =>
    props.i === 0 && props.variant === 'bordered'
      ? tw`rounded-l`
      : props.i === props.field.options.length - 1
      ? tw`rounded-r`
      : ''}
  ${(props) =>
    props.i !== 0 && props.variant === 'bordered' ? tw`border-l-0` : ''}
  ${(props) =>
    props.isDisabled || props.isSaved ? tw`bg-white pointer-events-none` : ''}
  ${(props) =>
    props.variant === 'bordered' &&
    !props.isSaved &&
    !props.isSelected &&
    !props.isDisabled &&
    !props.isSaved
      ? tw`text-indigo-400 hover:text-gray-600 bg-white hover:bg-gray-100 border-indigo-400`
      : ''}
  ${(props) =>
    props.isFailed && props.variant === 'bordered'
      ? tw`bg-white hover:bg-gray-100 border-red-400`
      : ''}
  ${(props) =>
    props.isSelected && props.variant === 'bordered'
      ? tw`bg-indigo-600 text-gray-100 border-indigo-600 pointer-events-none`
      : ''}
`;

export function SingleSelectRenderer({ field, handleAction, disabled }) {
  function handleClick(e, o) {
    if (!o.action) {
      e.preventDefault();
      return;
    }
    handleAction(e, o);
  }

  return (
    <SingleSelect align={field.align} direction={field.direction}>
      <p className="label">{field.label}</p>
      <div className="content">
        {field.options.map((o, i) => {
          const isSelected = field.value === o.id;
          const isFailed = field.save_state === 'failed';
          const isDisabled = disabled || field.disabled || o.disabled;
          const isSaved = field.save_state === 'saved';
          return (
            <SingleSelectButton
              onClick={(e) => handleClick(e, o)}
              key={`single-select-${field.id}-${o.id}`}
              isSelected={isSelected}
              isFailed={isFailed}
              isDisabled={isDisabled}
              isSaved={isSaved}
              variant={field.variant || 'bordered'}
              i={i}
              field={field}
              //className={'outline-none border'}
            >
              {o.text}
            </SingleSelectButton>
          );
        })}
      </div>
    </SingleSelect>
  );
}
