import React from 'react';
import tw from 'twin.macro';
import styled from '@emotion/styled';

const ListWrapper = styled.div`
  ${() => tw`subpixel-antialiased bg-white overflow-hidden`}

  ${() => tw`my-2`}

  ${() => {
    return tw`border-b border-gray-200`;
  }}

  ul {
    ${() => tw`m-0 p-0`}
  }

  .list-item {
    ${() => tw`border-b border-gray-200`}
  }

  .list-item:last-child {
    border-bottom: none;
  }
`;

interface ITheme {
  size: string;
  palette: any;
}

type ListItemWrapperProps = {
  pointer: boolean;
  theme: ITheme;
};
const ListItemWrapper = styled.div<ListItemWrapperProps>`
  ${() => tw`block
  dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800
  hover:bg-gray-100
  focus:outline-none focus:bg-gray-200 transition duration-150
  ease-in-out`}

  ${(props) => (props.pointer ? tw`cursor-pointer` : '')} 

  .content {
    ${(props) => (props.theme.size === 'sm' ? tw`px-1 py-2` : tw`px-4 py-4`)};

    ${() => tw`flex items-center`}
  }

  .avatar-content {
    ${() => tw`min-w-0 flex-1 flex items-center`}
  }

  .action-svg {
    ${() => tw`h-5 w-5 text-gray-400`}
  }
`;

type ListItemTextWrapperProps = {
  theme: ITheme;
};

const ListItemTextWrapper = styled.div<ListItemTextWrapperProps>`
  ${(props) => (props.theme.size === 'sm' ? tw`px-1` : tw`px-4 md:gap-4`)};

  ${() => tw`min-w-0 flex-1 md:grid md:grid-cols-1`}

  .tertiary {
    ${() => tw`hidden md:block`}
  }
`;

const ItemAvatarWrapper = styled.div`
  ${() => tw`flex-shrink-0`}
  img {
    ${() => tw`h-12 w-12 rounded-full dark:bg-white`}
  }
`;

type ItemListPrimaryContentWrapperProps = {
  theme: ITheme;
};

const ItemListPrimaryContentWrapper = styled.div<ItemListPrimaryContentWrapperProps>`
  ${() => tw`text-sm leading-5 font-bold truncate`}
  ${(props) =>
    props.theme.palette
      ? `color: ${props.theme.palette.primary};`
      : tw`dark:text-gray-200 text-gray-800`}
`;

const ItemListSecondaryContentWrapper = styled.div`
  ${() =>
    tw`mt-2 flex items-center text-xs leading-4 dark:text-gray-300 text-gray-500`}
  .span {
    ${() => tw`truncate`}
  }
`;

interface IList {
  children: React.ReactChild;
}

export default function List({ children }: IList) {
  return (
    <ListWrapper>
      <ul>{children}</ul>
    </ListWrapper>
  );
}

interface IListItem {
  avatar?: React.ReactElement<any>;
  action?: string;
  children?: React.ReactChild;
  onClick?: any;
}

export function ListItem({ avatar, action, children, onClick }: IListItem) {
  //const clicableClasses = onClick && 'cursor-pointer'

  return (
    <ListItemWrapper className="list-item" pointer={onClick}>
      <div className="list-item-b" onClick={onClick && onClick}>
        <div className="content">
          <div className="avatar-content">
            {avatar && avatar}

            {children}
          </div>

          {action && (
            <div>
              <svg
                className="action-svg"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                ></path>
              </svg>
            </div>
          )}
        </div>
      </div>
    </ListItemWrapper>
  );
}

export function ListItemText({ primary, secondary, terciary }) {
  return (
    <ListItemTextWrapper>
      <div>
        {primary && primary}

        {secondary && secondary}
      </div>

      <div className="tertiary">
        <div>{terciary && terciary}</div>
      </div>
    </ListItemTextWrapper>
  );
}

export function ItemAvatar({ avatar }) {
  return (
    <ItemAvatarWrapper className="flex-shrink-0">
      <img src={avatar} alt="" />
    </ItemAvatarWrapper>
  );
}

export function ItemListPrimaryContent({ children }) {
  return (
    <ItemListPrimaryContentWrapper>{children}</ItemListPrimaryContentWrapper>
  );
}

export function ItemListSecondaryContent({ children }) {
  return (
    <ItemListSecondaryContentWrapper>
      {/* <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884zM18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" clipRule="evenodd"></path>
      </svg> */}
      <span>{children}</span>
    </ItemListSecondaryContentWrapper>
  );
}

// image support
export function ListRenderer({ field, handleAction }) {
  return (
    <List>
      {field.items.map((o) => (
        <ListItem
          key={o.id}
          avatar={o.image && <img width={55} src={o.image} />}
          onClick={(e) => {
            o.action && handleAction(e, o);
          }}
        >
          <ListItemText
            primary={<ItemListPrimaryContent>{o.title}</ItemListPrimaryContent>}
            secondary={
              <ItemListSecondaryContent>{o.subtitle}</ItemListSecondaryContent>
            }
            terciary={
              <React.Fragment>
                <div
                  className="mt-2 flex items-center
                        text-sm leading-5 text-gray-500 dark:text-gray-200 justify-end"
                >
                  {o.tertiary_text}
                </div>
              </React.Fragment>
            }
          />
        </ListItem>
      ))}
    </List>
  );
}
