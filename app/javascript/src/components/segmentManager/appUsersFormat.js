import React from 'react'
import Avatar from '@material-ui/core/Avatar';
import Typography from '@material-ui/core/Typography'
import styled from 'styled-components'
import Moment from 'react-moment';

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
      name: 'id',
      options: {
        filter: false
      }
    },
    {
        name: 'email',
        options: {
          filter: false,
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
                <Typography>{value}</Typography>
              </NameWrapper>
            );
          }
        },

        /*content: 'Name',
        isSortable: true,
        width: withWidth ? 25 : undefined,*/
      },
      {
        name: 'lastVisitedAt',
        options: {
          filter: false,
          customBodyRender: (value, tableMeta, updateValue) => {
            return <Moment fromNow>
                    {value}
                   </Moment>
          }
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