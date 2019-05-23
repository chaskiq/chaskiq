import Avatar from '@atlaskit/avatar';
import styled from 'styled-components'

const NameWrapper = styled.span`
  display: flex;
  align-items: center;
`;

const AvatarWrapper = styled.div`
  margin-right: 8px;
`;

export const appUsersFormat = (withWidth: boolean) => {

  return [
      {
        name: 'email',
        options: {
          filter: false
        },

        customBodyRender: (value, tableMeta, updateValue) => {
          return (
            <NameWrapper>
              <AvatarWrapper>
                <Avatar
                  name={value}
                  size="medium"
                  src={`https://api.adorable.io/avatars/24/${encodeURIComponent(
                    value,
                  )}.png`}
                />
              </AvatarWrapper>
              <a href="#">{value}</a>
            </NameWrapper>
          );
        }

        /*content: 'Name',
        isSortable: true,
        width: withWidth ? 25 : undefined,*/
      },
      {
        name: 'lastVisitedAt',
        options: {
          filter: false
        }
        /*content: 'state',
        shouldTruncate: true,
        isSortable: true,
        width: withWidth ? 15 : undefined,*/
      },
      
      {
        name: 'os',
        options: {
          filter: false
        }
        /*content: 'Las visited at',
        shouldTruncate: true,
        isSortable: true,
        width: withWidth ? 10 : undefined,*/
      },

      {
        name: 'osVersion',
        options: {
          filter: false
        }
        /*content: 'Term',
        shouldTruncate: true,
        isSortable: true,
        width: withWidth ? 10 : undefined,*/
      },

      {
        name: 'state',
        options: {
          filter: false
        }
        /*content: 'Term',
        shouldTruncate: true,
        isSortable: true,
        width: withWidth ? 10 : undefined,*/
      }
    ]
};