import React from 'react'
import { ResponsivePie } from '@nivo/pie'
// make sure parent container have a defined height when using
// responsive component, otherwise height will be 0 and
// no chart will be rendered.
// website examples showcase many properties,
// you'll often use just a few of them.

import { useTheme } from '@material-ui/core/styles';


export default function MyResponsivePie({ data }) {
const theme = useTheme();

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
        radialLabelsTextColor={theme.palette.primary.light}
        radialLabelsLinkOffset={0}
        radialLabelsLinkDiagonalLength={5}
        radialLabelsLinkHorizontalLength={9}
        radialLabelsLinkStrokeWidth={5}
        //radialLabelsLinkColor={{ from: 'color', modifiers: [] }}
        slicesLabelsSkipAngle={10}
        slicesLabelsTextColor={theme.palette.primary.light}
        animate={true}
        motionStiffness={90}
        motionDamping={15}
        theme={{
            tooltip: {
                container: {
                    background: 'white',
                    color: 'black',
                    fontSize: 'inherit',
                    borderRadius: '2px',
                    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.25)',
                    padding: '5px 9px'
                },
                basic: {
                    whiteSpace: 'pre',
                    display: 'flex',
                    alignItems: 'center'
                },
                table: {},
                tableCell: {
                    padding: '3px 5px'
                }
            }
        }}
    />
}