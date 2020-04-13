import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from "@date-io/moment"
import React, { useState } from "react";
import { DateTimePicker, KeyboardDateTimePicker } from "@material-ui/pickers";

function InlineDateTimePickerDemo(props) {
  const [selectedDate, handleDateChange] = useState(props.value);

  return (
    <MuiPickersUtilsProvider utils={DateFnsUtils}>
      <KeyboardDateTimePicker
        variant="inline"
        ampm={false}
        label={props.label}
        name={props.name}
        value={selectedDate}
        onChange={(date)=> { 
          handleDateChange(date)
        }}
        onError={console.log}
        //disablePast
        format="YYYY/MM/DD HH:mm"
      />
    </MuiPickersUtilsProvider>
  );
}

export default InlineDateTimePickerDemo;

