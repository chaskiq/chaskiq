import React from 'react';
import styled from '@emotion/styled';
import tw from 'twin.macro';

const CheckboxGroup = styled.div`
  ${() => tw`block`}

  .label {
    ${() => tw`text-gray-700 dark:text-gray-200`}
  }

  .wrapper {
    ${() => tw`mt-2`}
    label {
      ${() => tw`inline-flex items-center`}
      input {
        ${() => tw`text-indigo-600`}
      }
    }
    .pad {
      ${() => tw`ml-2`}
    }
  }
`;

type CheckBoxesRendererOptionsProps = {
  id: string | number;
  name: string;
  disabled: boolean;
  text: string;
};

type CheckBoxesRendererProps = {
  field: {
    id: string;
    label: string;
    save_state: string;
    disabled: boolean;
    options: Array<CheckBoxesRendererOptionsProps>;
    value: any;
  };
};

export function CheckBoxesRenderer({ field }: CheckBoxesRendererProps) {
  return (
    <CheckboxGroup>
      <span className="label">{field.label}</span>
      <div className="wrapper">
        {field.options &&
          field.options.map((o: CheckBoxesRendererOptionsProps) => (
            <div key={`field-${field.id}-${o.id}`}>
              <label>
                <input
                  name={o.name}
                  disabled={
                    field.disabled || o.disabled || field.save_state === 'saved'
                  }
                  type="checkbox"
                  defaultChecked={field.value && field.value.includes(o.id)}
                />
                <span className="pad">{o.text}</span>
              </label>
            </div>
          ))}
      </div>
    </CheckboxGroup>
  );
}
