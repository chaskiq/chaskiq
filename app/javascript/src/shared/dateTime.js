
/*import DateFnsUtils from "@date-io/moment";
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

}*/



import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from "@date-io/moment"
import React, { useState } from "react";
import { DateTimePicker, KeyboardDateTimePicker } from "@material-ui/pickers";

function InlineDateTimePickerDemo(props) {
  const [selectedDate, handleDateChange] = useState(new Date("2018-01-01T00:00:00.000Z"));

  return (
    <MuiPickersUtilsProvider utils={DateFnsUtils}>
      <KeyboardDateTimePicker
        variant="inline"
        ampm={false}
        label={props.label}
        value={selectedDate}
        onChange={(date)=> { 
          handleDateChange(date)
        }}
        onError={console.log}
        //disablePast
        format="yyyy/MM/dd HH:mm"
      />
    </MuiPickersUtilsProvider>
  );
}

export default InlineDateTimePickerDemo;

