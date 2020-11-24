import React from 'react'
import { ResponsivePie } from '@nivo/pie'
// import { useTheme } from '@material-ui/core/styles';

// make sure parent container have a defined height when using responsive component,
// otherwise height will be 0 and no chart will be rendered.
// website examples showcase many properties, you'll often use just a few of them.
export default function CampaignPie ({ data }) {
  // const theme = useTheme();

  const theme = {
    palette: {
      primary: {
        light: '#ff000'
      }
    }
  }

  return (

    <ResponsivePie
      data={data}
      margin={{ top: 4, right: 8, bottom: 80, left: 8 }}
      startAngle={-180}
      sortByValue={true}
      colors={{ scheme: 'purple_blue' }}
      borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
      enableRadialLabels={false}
      radialLabelsSkipAngle={8}
      radialLabelsTextColor="#333333"
      radialLabelsLinkColor={{ from: 'color' }}
      sliceLabelsRadiusOffset={0.65}
      sliceLabelsSkipAngle={11}
      sliceLabelsTextColor="#333333"
      defs={[
        {
          id: 'dots',
          type: 'patternDots',
          background: 'inherit',
          color: 'rgba(255, 255, 255, 0.3)',
          size: 4,
          padding: 1,
          stagger: true
        },
        {
          id: 'lines',
          type: 'patternLines',
          background: 'inherit',
          color: 'rgba(255, 255, 255, 0.3)',
          rotation: -45,
          lineWidth: 6,
          spacing: 10
        }
      ]}
      
      legends={[
        {
          anchor: 'bottom',
          direction: 'row',
          justify: false,
          translateX: 0,
          translateY: 56,
          itemsSpacing: 0,
          itemWidth: 100,
          itemHeight: 18,
          itemTextColor: '#999',
          itemDirection: 'left-to-right',
          itemOpacity: 1,
          symbolSize: 18,
          symbolShape: 'circle',
          effects: [
            {
              on: 'hover',
              style: {
                itemTextColor: '#000'
              }
            }
          ]
        }
      ]}
    />

  )
}
