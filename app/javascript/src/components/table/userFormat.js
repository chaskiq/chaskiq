import React from 'react'
import Moment from 'react-moment';
import Badge from '@material-ui/core/Badge';
import Avatar from '@material-ui/core/Avatar';
import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'
import styled from '@emotion/styled'
import MuiChip from '@material-ui/core/Chip';
import { makeStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux'

const NameWrapper = styled.span`
  display: flex;
  align-items: center;
`;

const AvatarWrapper = styled.div`
  margin-right: 8px;
`;

const useStyles = makeStyles(theme => ({
  root: {
    //border: '1px solid rgba(0, 0, 0, .125)',
    borderRadius: '3px',
    '&:not(:last-child)': {
      borderBottom: 0,
    },
  },
  colorPrimary: {
    backgroundColor: '#12af12'
  },
  'colorSecondary': {
    color: theme.palette.primary.dark,
    backgroundColor: '#f5f5d5'
  },

  //online: {colorSecondary: theme.palette.common.green},
  //offline: {background: theme.palette.common.offline}
  
}));

function Chip(props) {
  const classes = useStyles();

  return (
    <MuiChip {...props} 
      classes={classes}>
      Theming
    </MuiChip>
  );
}

function UserBadge(props) {
  const classes = useStyles();
  const {row} = props
  return (
    <Badge 
      classes={{badge: row.online ? classes.online : classes.offline} } 
      color={row.online ? "primary" : 'secondary' }
      variant="dot">
      <Avatar
        name={row.email}
        size="medium"
        src={row.avatarUrl}
      />
    </Badge>
  );
}


const userFormat = function(showUserDrawer, app){

  let opts = [
    //{field: 'id', title: 'id' }, 
    {field: 'email', title: 'Name', 
      render: (row) => {
        return row && 

        <NameWrapper 
          onClick={(e)=>(showUserDrawer && showUserDrawer(row))}>
          <AvatarWrapper>
            <UserBadge row={row}/>
          </AvatarWrapper>

          <Grid container direction={"column"}>

            <Typography variant="overline" display="block">
              {row.displayName}
            </Typography>

            <Typography variant={"caption"}>
              {row.email}
            </Typography>

          </Grid>
        
        </NameWrapper>
      }
    },
    {field: 'email', title:  'email', hidden: true}, 
    {field: 'state', title: 'state', render: (row)=>{
      return <Chip
              color={row.state === "subscribed" ? 'primary' : 'secondary'}
              label={row.state} 
              clickable={false}
             />
    }},
    {field: 'online', title:  'online', hidden: true}, 
    {field: 'lat', title: 'lat', hidden:true}, 
    {field: 'lng', title:  'lng', hidden: true}, 
    {field: 'postal', title:'postal', hidden: true},
    {field: 'browserLanguage', title:'browser Language', hidden: true}, 
    {field: 'referrer', title:'referrer', hidden: true}, 
    {field: 'os', title:'os', hidden: true}, 
    {field: 'osVersion', title:'os Version', hidden: true},
    {field: 'lang', title:'lang', hidden: true},
    {field: 'webSessions', title:'Web sessions'},
    {field: 'LastSeen', title:'Last seen'},
    {field: 'FirstSeen', title:'First seen'},

    {field: 'lastVisitedAt', 
      title: 'last visited at',
      render: row => (row ? <Moment fromNow>
                                    {row.lastVisitedAt}
                                  </Moment> : undefined)
    }]

    
    if(app.customFields && app.customFields.length > 0){
      const other = app.customFields.map((o)=>( 
        {
          hidden: true,
          field: o.name , 
          title: o.name, 
          render: row => row && row.properties[o.name]
        }
      ))
      opts = opts.concat(other)
    }

    

    return opts

}

export default userFormat

//function mapStateToProps(state) {
//  const { app } = state
//  return {
//    app
//  }
//}
//
//export default connect(mapStateToProps)(userFormat)
