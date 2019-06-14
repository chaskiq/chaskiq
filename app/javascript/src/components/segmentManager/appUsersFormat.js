import React from 'react'
import Avatar from '@material-ui/core/Avatar';
import Typography from '@material-ui/core/Typography'
import styled from 'styled-components'
import Moment from 'react-moment';
import Badge from '@material-ui/core/Badge';
import { makeStyles } from '@material-ui/core/styles';


const NameWrapper = styled.span`
  display: flex;
  align-items: center;
`;

const AvatarWrapper = styled.div`
  margin-right: 8px;
`;

const useStyles = makeStyles(theme => ({
  margin: {
    margin: theme.spacing(2),
  },
}));



export const appUsersFormat = (withWidth: boolean) => {

  //const classes = useStyles();

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
            const isOnline = _.isArray(tableMeta.rowData) ? 
                              tableMeta.rowData[5] === "online" : null
            //console.log(isOnline)
            return (
              <NameWrapper>
                <AvatarWrapper>
                  <Badge 
                    //className={classes.margin} 
                    color={isOnline ? "primary" : 'secondary' }
                    variant="dot">
                    <Avatar
                      name={value}
                      size="medium"
                      src={`https://api.adorable.io/avatars/24/${encodeURIComponent(
                        value,
                      )}.png`}
                    />
                  </Badge>
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