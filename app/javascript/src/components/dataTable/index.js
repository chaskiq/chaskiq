import React from "react";
import ReactDOM from "react-dom";
import MUIDataTable from "mui-datatables";
import CustomToolbarSelect from "./CustomToolbarSelect";
import CustomFooter from './footer'

import { CircularProgress } from '@material-ui/core';


export default class App extends React.Component {

  changePage = (page) => {
    this.props.search(this.props.meta.next_page)
  }


  render() {
    const columns = this.props.columns

    let data = this.props.data

    const options = {
      filter: false,
      selectableRows: true,
      filterType: "dropdown",
      responsive: "stacked",
      selectableRows: false,
      rowsPerPage: 20,
      elevation: false,
      serverSide: true,
      page: this.props.meta.current_page,
      count: this.props.meta.total_count,
      onRowClick: this.props.onRowClick,
      textLabels: {
        body: {
          noMatch: "Sorry, no matching records found",
          toolTip: "Sort",
        },
        pagination: {
          next: "Next Page",
          previous: "Previous Page",
          rowsPerPage: "Rows per page:",
          displayRows: "of",
          records: "records"
        },
        toolbar: {
          search: "Search",
          downloadCsv: "Download CSV",
          print: "Print",
          viewColumns: "View Columns",
          filterTable: "Filter Table",
        },
        filter: {
          all: "All",
          title: "FILTERS",
          reset: "RESET",
        },
        viewColumns: {
          title: "Show Columns",
          titleAria: "Show/Hide Table Columns",
        },
        selectedRows: {
          text: "row(s) selected",
          delete: "Delete",
          deleteAria: "Delete Selected Rows",
        },
      },


      serverSide: true,
      page: this.props.meta.current_page,
      count: this.props.meta.total_count,
      
      onTableChange: (action, tableState) => {

        console.log(action, tableState);
        // a developer could react to change on an action basis or
        // examine the state as a whole and do whatever they want

        switch (action) {
          case 'changePage':
            this.changePage(tableState.page);
            break;
        }
      },

      customFooter: (count, page, rowsPerPage, changeRowsPerPage, changePage, textLabels) => {
        return (  
          <CustomFooter 
            meta={this.props.meta}
            changePage={changePage} 
            count={this.props.meta.total_count}
            textLabels={options.textLabels.pagination}
          />
        );
      },
      customToolbarSelect: selectedRows => (
        <CustomToolbarSelect selectedRows={selectedRows} />
      )
    };

    const isLoading = this.props.loading 

    return (
      <div>
        {
          this.props.loading ? 

          <CircularProgress 
            style={{ 
              marginLeft: '50%', 
              marginTop: '4rem' 
            }} 
          /> :
        
          <MUIDataTable
            title={this.props.title}
            data={data}
            columns={columns}
            options={options}
          />
        }
      </div>
    );
  }
}

