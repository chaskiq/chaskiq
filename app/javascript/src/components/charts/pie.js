import React from 'react'
import { ResponsivePie } from '@nivo/pie'
// make sure parent container have a defined height when using
// responsive component, otherwise height will be 0 and
// no chart will be rendered.
// website examples showcase many properties,
// you'll often use just a few of them.
export default function MyResponsivePie({ data }) {

  return  <ResponsivePie
        data={data}
        margin={{ top: 10, right: 10, bottom: 20, left: 10 }}
        startAngle={271}
        endAngle={93}
        innerRadius={0.6}
        cornerRadius={15}
        colors={{ scheme: 'purple_blue' }}
        borderWidth={3}
        fit={true}
        
        colorBy={function (e) { return e.color }}
        borderWidth={0}
        borderColor="inherit:darker(0.2)"

        //borderColor={{ from: 'color', modifiers: [ [ 'darker', '0' ] ] }}
        radialLabelsSkipAngle={25}
        radialLabelsTextXOffset={6}
        radialLabelsTextColor="#333333"
        radialLabelsLinkOffset={0}
        radialLabelsLinkDiagonalLength={5}
        radialLabelsLinkHorizontalLength={9}
        radialLabelsLinkStrokeWidth={5}
        //radialLabelsLinkColor={{ from: 'color', modifiers: [] }}
        slicesLabelsSkipAngle={10}
        slicesLabelsTextColor="#333333"
        animate={true}
        motionStiffness={90}
        motionDamping={15}
        /*
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
        fill={[
            {
                match: {
                    id: 'Chrome'
                },
                id: 'dots'
            },
            {
                match: {
                    id: 'Firefox'
                },
                id: 'dots'
            },
            {
                match: {
                    id: 'Safari'
                },
                id: 'dots'
            },
            {
                match: {
                    id: 'Explorer'
                },
                id: 'dots'
            },
            {
                match: {
                    id: 'Brave'
                },
                id: 'lines'
            },
            {
                match: {
                    id: 'Opera'
                },
                id: 'lines'
            },
            {
                match: {
                    id: 'Samsung'
                },
                id: 'lines'
            }
        ]}
        legends={[
            {
                anchor: 'bottom',
                direction: 'row',
                translateY: 56,
                itemWidth: 100,
                itemHeight: 18,
                itemTextColor: '#999',
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
        ]}*/
    />
}