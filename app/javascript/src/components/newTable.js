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

          {/*<TableSelection
            selectByRowClick
            />
          */}

          <EditingState
            onCommitChanges={this.commitChanges}
          />
          
          <PagingPanel
            pageSizes={[]}
          />

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
            <React.Component>
             <TableEditRow />
             <TableEditColumn
                showAddCommand
                showEditCommand
                showDeleteCommand
             />
            </React.Component> : null 
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
