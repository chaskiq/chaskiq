import React from "react";
import PropTypes from "prop-types";
import TableRow from "@material-ui/core/TableRow";
import TableFooter from "@material-ui/core/TableFooter";
import TablePagination from "@material-ui/core/TablePagination";
import { withStyles } from "@material-ui/core/styles";

const defaultPaginationStyles = {
  root: {
    "&:last-child": {
      padding: "0px 24px 0px 24px",
    },
  },
  toolbar: {},
  selectRoot: {},
  "@media screen and (max-width: 400px)": {
    toolbar: {
      "& span:nth-child(2)": {
        display: "none",
      },
    },
    selectRoot: {
      marginRight: "8px",
    },
  },
};

class MUIDataTablePagination extends React.Component {
  static propTypes = {
    /** Total number of table rows */
    count: PropTypes.number.isRequired,
    /** Options used to describe table */
    options: PropTypes.object.isRequired,
    /** Current page index */
    page: PropTypes.number.isRequired,
    /** Total number allowed of rows per page */
    rowsPerPage: PropTypes.number.isRequired,
    /** Callback to trigger rows per page change */
    changeRowsPerPage: PropTypes.func.isRequired,
  };

  handleRowChange = event => {
    this.props.changeRowsPerPage(event.target.value);
  };

  handlePageChange = (_, page) => {
    this.props.changePage(page);
  };

  render() {
    const { count, classes, options, rowsPerPage, page } = this.props;

    const textLabels = {
      next: "Next Page",
      previous: "Previous Page",
      rowsPerPage: "Rows per page:",
      displayRows: "of",
    } //options.textLabels.pagination;

    return (
      <TableFooter>
        <TableRow>
          <TablePagination
            className={classes.root}
            classes={{
              caption: classes.caption,
              toolbar: classes.toolbar,
              selectRoot: classes.selectRoot,
            }}
            count={count}
            rowsPerPage={rowsPerPage}
            page={page}
            labelRowsPerPage={textLabels.rowsPerPage}
            labelDisplayedRows={ ({ from, to, count }) => {
              console.log(this.props)
              return `${from}-${to} ${textLabels.displayRows} ${count}`
            }
            }
            backIconButtonProps={{
              "aria-label": textLabels.previous,
            }}
            nextIconButtonProps={{
              "aria-label": textLabels.next,
            }}
            rowsPerPageOptions={[]}
            onChangePage={this.handlePageChange}
            onChangeRowsPerPage={this.handleRowChange}
          />
        </TableRow>
      </TableFooter>
    );
  }
}

export default withStyles(defaultPaginationStyles, { name: "MUIDataTablePagination" })(MUIDataTablePagination);
