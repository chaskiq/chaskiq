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

  TableEditRow,
  TableEditColumn,
} from '@devexpress/dx-react-grid-material-ui';
import { CircularProgress } from '@material-ui/core';
import {
  PagingState,
  IntegratedPaging,
  CustomPaging,
  SelectionState,
  EditingState
} from '@devexpress/dx-react-grid';
import {isUndefined} from 'lodash'

import { withStyles } from '@material-ui/core/styles';

import { ToolbarMapView } from '../components/segmentManager/toolbarPlugin';

const styles = theme => ({
  root: {
    marginTop: theme.spacing(3),
  }
});

class DataTable extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      selection: [],
    }
  }

  changeCurrentPage = (e)=>{
    this.props.search(e)
  }

  render() {
    const {selection} = this.state
    const { rows, columns , 
            tableColumnExtensions,
            rightColumns, leftColumns,
            defaultHiddenColumnNames
          } = this.props

   
    return (
      <Paper 
        elevation={!isUndefined(this.props.elevation) ? this.props.elevation : 1} 
        className={this.props.classes.root}>
        <Grid
          rows={rows}
          columns={columns}
        >



          {
            !this.props.disablePagination ?
              <PagingState
                currentPage={this.props.meta.current_page}
                defaultCurrentPage={1}
                onCurrentPageChange={this.changeCurrentPage}
                pageSize={20}
              /> : null 
          }

          {
            !this.props.disablePagination ?
            <CustomPaging
              totalCount={this.props.meta.total_count}
            /> : null 
          }
          
          <Table
            columnExtensions={tableColumnExtensions}
          />
          
          <TableHeaderRow />

          {/*<TableSelection
            selectByRowClick
            />
          */}

          <EditingState
            //editingRowIds={this.props.editingRowIds}
            onCommitChanges={this.props.commitChanges}
          />
          
         {
           !this.props.disablePagination ?
            <PagingPanel
              pageSizes={[]}
            /> : null
          }

          <TableColumnVisibility
            defaultHiddenColumnNames={defaultHiddenColumnNames}
          />
          <Toolbar />

          {
            this.props.enableMapView ?
              <ToolbarMapView
                map_view={this.props.map_view}
                onClick={this.props.toggleMapView} 
              />  : null
          }


          {
            this.props.tableEdit ?
             <TableEditRow /> : null
          }

          {
            this.props.tableEdit ?
             <TableEditColumn
                showAddCommand
                showEditCommand
                showDeleteCommand
             /> : null 
          }

          <TableFixedColumns
            leftColumns={leftColumns}
            rightColumns={rightColumns}
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
