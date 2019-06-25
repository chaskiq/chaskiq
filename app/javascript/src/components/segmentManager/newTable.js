import * as React from 'react';
import Paper from '@material-ui/core/Paper';
import {
  Grid,
  Table,
  TableHeaderRow,
  ColumnChooser,
  TableColumnVisibility,
  Toolbar,
  PagingPanel,
  TableSelection,
  TableFixedColumns,
} from '@devexpress/dx-react-grid-material-ui';
import { CircularProgress } from '@material-ui/core';
import gravatar from '../../shared/gravatar'
import {
  PagingState,
  IntegratedPaging,
  CustomPaging,
  SelectionState
} from '@devexpress/dx-react-grid';

import { withStyles } from '@material-ui/core/styles';


import Avatar from '@material-ui/core/Avatar';
import Typography from '@material-ui/core/Typography'
import styled from 'styled-components'
import Moment from 'react-moment';
import Badge from '@material-ui/core/Badge';

import { ToolbarMapView } from './toolbarPlugin';

const NameWrapper = styled.span`
  display: flex;
  align-items: center;
`;

const AvatarWrapper = styled.div`
  margin-right: 8px;
`;


const styles = theme => ({
  root: {
    marginTop: theme.spacing(3),
  }
});

class DataTable extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      defaultHiddenColumnNames: ['id', 
      'state', 
      'online', 
      'lat', 
      'lng', 
      'postal',
      'browserLanguage', 
      'referrer', 
      'os', 
      'osVersion',
      'lang'],

      columns: [
                //{name: 'id', title: 'id'},
                {name: 'email', title: 'email', 
                  getCellValue: row => (row ? 

                    <NameWrapper onClick={(e)=>(this.props.showUserDrawer(row))}>
                      <AvatarWrapper>
                        <Badge 
                          //className={classes.margin} 
                          color={row.online ? "primary" : 'secondary' }
                          variant="dot">
                          <Avatar
                            name={row.email}
                            size="medium"
                            src={gravatar(row.email)}
                          />
                        </Badge>
                      </AvatarWrapper>

                      <Typography>{row.email}</Typography>
                      <Typography variant="overline" display="block">
                        {row.name}
                      </Typography>
                    </NameWrapper>

                   : undefined)
                },
                {name: 'lastVisitedAt', 
                  title: 'lastVisitedAt',
                  getCellValue: row => (row ? <Moment fromNow>
                                                {row.lastVisitedAt}
                                              </Moment> : undefined)
                },
                {name: 'os', title: 'os'},
                {name: 'osVersion', title: 'osVersion'},
                {name: 'state', title: 'state'},
                {name: 'online', title: 'online'},

                {name: 'referrer', title: 'referrer'},
                {name: 'ip', title: 'ip'},
                {name: 'city', title: 'city'},
                {name: 'region', title: 'region'},
                {name: 'country', title: 'country'},
                {name: 'lat', title: 'lat'},
                {name: 'lng', title: 'lng'},
                {name: 'postal', title: 'postal'},
                {name: 'webSessions', title: 'webSessions'},
                {name: 'timezone', title: 'timezone'},
                {name: 'browser', title: 'browser'},
                {name: 'browserVersion', title: 'browserVersion'},
                {name: 'browserLanguage', title: 'browserLanguage'},
                {name: 'lang', title: 'lang'}
              ],
      selection: [],
      tableColumnExtensions: [
        //{ columnName: 'id', width: 150 },
        { columnName: 'email', width: 250 },
        { columnName: 'lastVisitedAt', width: 120 },
        { columnName: 'os', width: 100 },
        { columnName: 'osVersion', width: 100 },
        { columnName: 'state', width: 80 },
        { columnName: 'online', width: 80 },

        //{ columnName: 'amount', align: 'right', width: 140 },
      ],
      leftColumns: ['email'],
      rightColumns: ['online'],
    }
  }

  changeCurrentPage = (e)=>{
    this.props.search(e)
  }



  render() {
    const { rows } = this.props;
    const {  columns, selection, 
            tableColumnExtensions,
            rightColumns, leftColumns,
            defaultHiddenColumnNames
          } = this.state

    return (
      <Paper className={this.props.classes.root}>
        <Grid
          rows={rows}
          columns={columns}
        >

          <PagingState
            currentPage={this.props.meta.current_page}
            defaultCurrentPage={1}
            onCurrentPageChange={this.changeCurrentPage}
            pageSize={20}
          />

          {/*<SelectionState
            selection={selection}
            onSelectionChange={this.changeSelection}
          />*/}
          
          {/*<IntegratedPaging />*/}

          <CustomPaging
            totalCount={this.props.meta.total_count}
          />
          
          <Table
            columnExtensions={tableColumnExtensions}
          />
          
          <TableHeaderRow />

          <TableFixedColumns
            leftColumns={leftColumns}
            rightColumns={rightColumns}
          />

          {/*<TableSelection
            selectByRowClick
            />
          */}
          
          <PagingPanel
            pageSizes={[]}
          />

          <TableColumnVisibility
            defaultHiddenColumnNames={defaultHiddenColumnNames}
          />
          <Toolbar />

          <ToolbarMapView
            map_view={this.props.map_view}
            onClick={this.props.toggleMapView} 
          />

          <ColumnChooser />
        </Grid>

        {
          this.props.loading ?
          <CircularProgress 
              style={{ 
                marginLeft: '50%', 
                marginTop: '4rem' 
              }} 
            /> : null 
        }

      </Paper>
    );
  }
}

export default withStyles(styles, { withTheme: true })(DataTable);
