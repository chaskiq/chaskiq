import { Controller } from "@hotwired/stimulus"
import { ResponsiveCalendarCanvas, ResponsiveCalendar } from '@nivo/calendar';
import React from 'react';
import { createRoot } from 'react-dom/client';
import moment from 'moment';
import './index.css'

// Add a Stimulus controller for this component.
// It will automatically registered and its name will be available
// via #component_name in the component class.
//
// import { Controller as BaseController } from "stimulus";
//
export default class extends Controller {
  initialize() {
    const root = createRoot(this.element);
    root.render(
      <div className="h-40">
        <HeatMap 
          data={JSON.parse(this.element.dataset.points)}
          from={this.element.dataset.from}
          to={this.element.dataset.to}
        />
      </div>
    )
   }

  disconnect() {}
}

const theme = {
  palette: {
    primary: {
      light: '#112343',
      main: '#123443',
    },
  },
};

function HeatMap({ data, from, to }){

  let fromTime = moment(from).toISOString()
  let toTime = moment(to).toISOString()

  console.log(data)
  console.log(fromTime, toTime)

  
  return <ResponsiveCalendarCanvas
  data={data}
  from={fromTime}
  to={toTime}

  //from="2015-03-01"
  //to="2016-07-12"
  //colors={{ scheme: 'nivo' }}
  emptyColor="#eeeeee"
  colors={['#61cdbb', '#97e3d5', '#e8c1a0', '#f47560']}
  margin={{ top: 10, right: 20, bottom: 10, left: 20 }}
  yearSpacing={40}
  monthBorderColor="#000000"
  dayBorderWidth={2}
  dayBorderColor="#ffffff"
  theme={{
    labels: {
      text: {
        fill: theme.palette.primary.light,
        fontSize: 11,
        fontFamily: 'Roboto, sans-serif',
        color: theme.palette.primary.light,
      },
    },
    legends: {
      text: { fill: theme.palette.primary.main, fontSize: 11 },
    },

    tooltip: {
      container: {
        background: 'white',
        color: 'black',
        fontSize: 'inherit',
        borderRadius: '2px',
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.25)',
        padding: '5px 9px',
      },
      basic: {
        whiteSpace: 'pre',
        display: 'flex',
        alignItems: 'center',
      },
      table: {},
      tableCell: {
        padding: '3px 5px',
      },
    },
  }}
  legends={[
    {
      //color: '#ff000',
      anchor: 'bottom-right',
      direction: 'row',
      translateY: 36,
      itemCount: 4,
      itemWidth: 42,
      itemHeight: 36,
      itemsSpacing: 14,
      itemDirection: 'right-to-left',
    },
  ]}
/>
}
