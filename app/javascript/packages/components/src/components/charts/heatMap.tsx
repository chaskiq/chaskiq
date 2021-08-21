import React from 'react';
import { ResponsiveCalendarCanvas } from '@nivo/calendar';
export default function MyResponsiveCalendar({ data, from, to }) {
  const theme = {
    palette: {
      primary: {
        light: '#112343',
        main: '#123443',
      },
    },
  };

  return (
    <ResponsiveCalendarCanvas
      data={data}
      from={from._d.toISOString()}
      to={to._d.toISOString()}
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
  );
}
