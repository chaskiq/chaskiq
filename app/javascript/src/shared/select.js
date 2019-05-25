import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Input from '@material-ui/core/Input';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import FilledInput from '@material-ui/core/FilledInput';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';

/*
const styles = theme => ({
  root: {
    display: 'flex',
    flexWrap: 'wrap',
    width: '100%'
  },
  formControl: {
    //margin: theme.spacing.unit,
    width: '100%'
    //minWidth: 120,
  },
  selectEmpty: {
    width: '100%',
    marginTop: theme.spacing.unit * 2,
  },
});*/

class SimpleSelect extends React.Component {
  state = {
    value: '',
    labelWidth: 0,
  };

  componentDidMount() {
    /*this.setState({
      labelWidth: ReactDOM.findDOMNode(this.InputLabelRef).offsetWidth,
    });*/
  }

  handleChange = event => {
    this.setState({ value: event.target.value });
  };

  render() {
    const { classes } = this.props;

    return (
      <FormControl className={classes.formControl}>
          
          <InputLabel htmlFor={this.props.data.label}>
            {this.props.data.name}
          </InputLabel>

          <Select
            name={this.props.name}
            value={this.state.value}
            onChange={this.handleChange}
            inputProps={{
              name: this.props.name
            }}
          >
            <MenuItem value="">
              <em>None</em>
            </MenuItem>

            {
              this.props.data.options.map(
                (o, i)=> <MenuItem value={o} key={o}>
                        {o}
                      </MenuItem> 
              )
            }
          </Select>
      </FormControl>
    );
  }
}

SimpleSelect.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default SimpleSelect
//export default withStyles(styles)(SimpleSelect);