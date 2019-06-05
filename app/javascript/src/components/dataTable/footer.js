import React from "react";
import PropTypes from "prop-types";
import TableRow from "@material-ui/core/TableRow";
import TableFooter from "@material-ui/core/TableFooter";
import TablePagination from "@material-ui/core/TablePagination";

import { makeStyles, useTheme , withTheme, withStyles} from '@material-ui/core/styles';

import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';
import IconButton from '@material-ui/core/IconButton';

import FirstPageIcon from '@material-ui/icons/FirstPage';
import LastPageIcon from '@material-ui/icons/LastPage';

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
    const { count, classes, options, rowsPerPage, page, meta, textLabels } = this.props;

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
            ActionsComponent={TablePaginationActions}
            labelRowsPerPage={textLabels.rowsPerPage}
            labelDisplayedRows={ ({ from, to, count }) => {
              console.log(this.props.meta)
              return `page 
              ${this.props.meta.current_page} 
              ${textLabels.displayRows} 
              ${this.props.meta.total_pages} 
              ${count} 
              ${textLabels.records}`
              //return `${from}-${to} ${textLabels.displayRows} ${count}`
            }
            }
            backIconButtonProps={{
              "aria-label": textLabels.previous,
              meta: this.props.meta
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



const useStyles1 = makeStyles(theme => ({
  root: {
    flexShrink: 0,
    color: theme.palette.text.secondary,
    marginLeft: theme.spacing(2.5),
  },
}));


function TablePaginationActions(props) {
  const classes = useStyles1();
  const theme = useTheme();
  const { count, page, rowsPerPage, onChangePage } = props;

  const meta = props.backIconButtonProps.meta

  function handleFirstPageButtonClick(event) {
    onChangePage(event, 0);
  }

  function handleBackButtonClick(event) {
    onChangePage(event, page - 1);
  }

  function handleNextButtonClick(event) {
    onChangePage(event, page + 1);
  }

  function handleLastPageButtonClick(event) {
    onChangePage(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1));
  }

  return (
    <div className={classes.root}>

      {/*<IconButton
              onClick={handleFirstPageButtonClick}
              disabled={page === 0}
              aria-label="First Page"
            >
              {theme.direction === 'rtl' ? <LastPageIcon /> : <FirstPageIcon />}
            </IconButton>*/}

      <IconButton onClick={handleBackButtonClick} 
        disabled={!meta.prev_page }
        aria-label="Previous Page">
        {theme.direction === 'rtl' ? 
        <KeyboardArrowRight /> : 
        <KeyboardArrowLeft />
      }
      </IconButton>

      <IconButton
        onClick={handleNextButtonClick}
        //disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        disabled={!meta.next_page }
        aria-label="Next Page"
      >
        {theme.direction === 'rtl' ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
      </IconButton>

      {/*<IconButton
              onClick={handleLastPageButtonClick}
              //disabled={page >= Math.ceil(count / rowsPerPage) - 1}
              aria-label="Last Page"
            >
              {theme.direction === 'rtl' ? <FirstPageIcon /> : <LastPageIcon />}
            </IconButton>*/}
    </div>
  );
}

export default withStyles(defaultPaginationStyles, { name: "MUIDataTablePagination" })(MUIDataTablePagination);
