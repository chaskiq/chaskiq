import React from "react";
import ReactDOM from "react-dom";
import MUIDataTable from "mui-datatables";
import CustomToolbarSelect from "./CustomToolbarSelect";
import CustomFooter from './footer'

export default class App extends React.Component {
  render() {
    const columns = this.props.columns

    let data = this.props.data

    const options = {
      filter: true,
      selectableRows: true,
      filterType: "dropdown",
      responsive: "stacked",
      selectableRows: false,
      rowsPerPage: 10,
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

      customFooter: (count, page, rowsPerPage, changeRowsPerPage, changePage, textLabels) => {
        return (  
          <CustomFooter 
            changePage={changePage} 
            count={this.props.meta.total_count}
          />
        );
      },
      onTableChange: (action, tableState) => {
        console.log(tableState.page)
        console.log(this.props)
        this.props.search(this.props.meta.next_page)
        /*this.xhrRequest('my.api.com/tableData', result => {
          this.setState({ data: result });
        });*/
      },
      onChangePage22  : (currentPage) => {
        //const { prev, limit } = this.state;
        // every change page it will check the page that should be make a new request or not
        /*if(currentPage > prev) {
          this.setState({prev: prev+1})
          this.onNextPage(limit, currentPage*limit); 
        }*/
      }
      ,
      customToolbarSelect: selectedRows => (
        <CustomToolbarSelect selectedRows={selectedRows} />
      )
    };

    return (
      <MUIDataTable
        title={this.props.title}
        data={data}
        columns={columns}
        options={options}
      />
    );
  }
}