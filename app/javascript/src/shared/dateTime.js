
import DateFnsUtils from "@date-io/moment";
import {
  DatePicker,
  TimePicker,
  DateTimePicker,
  MuiPickersUtilsProvider,
  InlineDateTimePicker,
} from "material-ui-pickers";
import React from 'react'


export default class DateTime extends React.Component {
  state = {
    value: this.props.defaultValue
  }

  handleOnChange =(data)=>{
    this.setState({
      value: data
    }, ()=>{
      this.props.handleOnChange ? this.props.handleOnChange(data) : null
    })
  }

  render(){
    return <MuiPickersUtilsProvider utils={DateFnsUtils}>
            <div className="pickers">
              <InlineDateTimePicker 
                name={this.props.name}
                value={this.state.value}
                onChange={this.handleOnChange}
                label={this.props.label}
                format={"YYYY/MM/DD hh:mm A"}
              />
            </div>
          </MuiPickersUtilsProvider>
  }

}

