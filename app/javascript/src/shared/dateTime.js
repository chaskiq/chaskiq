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
        format="YYYY/MM/DD HH:mm"
      />
    </MuiPickersUtilsProvider>
  );
}

export default InlineDateTimePickerDemo;

