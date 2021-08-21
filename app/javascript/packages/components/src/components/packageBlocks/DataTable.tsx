import React from 'react';
import styled from '@emotion/styled';
import tw from 'twin.macro';

const Dt = styled.dt`
  ${() => tw`text-sm leading-5 font-medium text-gray-500 dark:text-gray-200`};
`;

const Dd = styled.dd`
  ${() =>
    tw`mt-1 text-sm leading-5 text-gray-900 dark:text-gray-100 sm:mt-0 sm:col-span-2`};
`;

type DataTableProps = {
  theme: {
    size?: 'sm';
  };
};

const DataTable = styled.dl<DataTableProps>`
  ${(props) =>
    props.theme.size === 'sm'
      ? tw`px-1 py-1 grid sm:grid-cols-3 sm:gap-4 sm:px-1`
      : tw`px-4 py-5 grid sm:grid-cols-3 sm:gap-4 sm:px-6`};
`;

type FieldProp = {
  field: {
    items: Array<FieldItemProp>;
  };
};

type FieldItemProp = {
  field: string;
  value: string;
};

export function DataTableRenderer({ field }: FieldProp) {
  return (
    <DataTable>
      {field.items &&
        field.items.map((o: FieldItemProp, i: number) => (
          <React.Fragment key={`dl-${o.field}-${i}`}>
            <Dt>{o.field}</Dt>
            <Dd>{o.value}</Dd>
          </React.Fragment>
        ))}
    </DataTable>
  );
}
