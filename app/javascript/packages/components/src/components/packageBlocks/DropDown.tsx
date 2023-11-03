import React from 'react';
import styled from '@emotion/styled';
import tw from 'twin.macro';
import { Label } from './shared';
const DropDown = styled.div`
  ${tw`relative inline-block text-left w-full`}

  .content {
    ${() =>
      tw`z-50 w-full origin-top-right absolute right-0 mt-2 rounded-md shadow-lg`}
  }

  .content-wrap {
    ${tw`rounded-md bg-white dark:bg-gray-800 shadow-xs`}
    height: 130px;
    overflow: auto;
  }
  .py-1 {
    ${() => tw`py-1`}
  }
`;

type ItemButtonProps = {
  selected?: boolean;
};

const ItemButton = styled.button<ItemButtonProps>`
  ${() => tw`w-full text-left block px-4 py-2 text-sm leading-5
    text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900
    dark:text-gray-300 dark:hover:bg-gray-900 dark:hover:text-gray-100 dark:focus:bg-gray-900 dark:focus:text-gray-100
    focus:outline-none `}

  ${(props) => (props.selected ? tw`bg-gray-100` : '')}
`;

const SelectButton = styled.button`
  ${() => tw`inline-flex justify-between w-full rounded-md
  border border-gray-300 px-4 py-2 
  bg-white text-gray-700 hover:text-gray-500
  dark:bg-black dark:text-white
  text-sm leading-5 font-medium
  focus:outline-none focus:border-blue-300 focus:shadow-outline
  active:bg-gray-100 active:text-gray-800 transition ease-in-out duration-150`}

  svg {
    ${() => tw`-mr-1 ml-2 h-5 w-5`}
  }
`;

// TODO: disabled state / error state / saved state
export function DropdownRenderer({ field }) {
  const [open, setOpen] = React.useState(false);

  const defaultValue =
    field.value && field.options.find((o) => o.id === field.value);

  const [selected, setSelected] = React.useState(defaultValue);

  React.useEffect(() => {
    if (selected) setOpen(false);
  }, [selected]);

  console.log(selected);

  return (
    <DropDown>
      <div>
        {field.label && <Label>{field.label}</Label>}
        <span className="rounded-md shadow-sm">
          <SelectButton
            onClick={() => setOpen(!open)}
            type="button"
            id="options-menu"
            aria-haspopup="true"
            aria-expanded="true"
          >
            {selected ? selected.text : 'Choose one...'}
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </SelectButton>

          {selected && (
            <input
              type="hidden"
              value={selected.id || ''}
              name={field.id || field.name}
            />
          )}
        </span>
      </div>

      {open && (
        <div className="content">
          <div className="content-wrap">
            <div
              className="py-1"
              role="menu"
              aria-orientation="vertical"
              aria-labelledby="options-menu"
            >
              {field.options &&
                field.options.map((o) => (
                  <div key={`${field.id}-${o.id}`}>
                    <ItemButton
                      onClick={() => setSelected(o)}
                      key={`field-${field.id}-${o.id}`}
                      type="button"
                      selected={selected && selected.id === o.name}
                      role="menuitem"
                    >
                      {o.text}
                    </ItemButton>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </DropDown>
  );
}
