// make sure parent container have a defined height when using
// responsive component, otherwise height will be 0 and
// no chart will be rendered.
// website examples showcase many properties,
// you'll often use just a few of them.
import React from 'react'
//import { ResponsiveCalendar } from '@nivo/calendar'
import { ResponsiveCalendarCanvas } from '@nivo/calendar'


export default function MyResponsiveCalendar({data, from, to}) {
  return <ResponsiveCalendarCanvas
      data={data}
      from={from._d.toISOString()}
      to={to._d.toISOString()}
      emptyColor="#eeeeee"
      colors={[ '#61cdbb', '#97e3d5', '#e8c1a0', '#f47560' ]}
      margin={{ top: 10, right: 20, bottom: 10, left: 20 }}
      yearSpacing={40}
      monthBorderColor="#ffffff"
      dayBorderWidth={2}
      dayBorderColor="#ffffff"
      legends={[
          {
              anchor: 'bottom-right',
              direction: 'row',
              translateY: 36,
              itemCount: 4,
              itemWidth: 42,
              itemHeight: 36,
              itemsSpacing: 14,
              itemDirection: 'right-to-left'
          }
      ]}
  />
}