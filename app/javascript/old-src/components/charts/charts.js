import React, { Component } from 'react'
import { ResponsivePie } from '@nivo/pie'
import { useTheme } from '@material-ui/core/styles';

// make sure parent container have a defined height when using responsive component,
// otherwise height will be 0 and no chart will be rendered.
// website examples showcase many properties, you'll often use just a few of them.
export default function CampaignPie({data}){

  const theme = useTheme();

  return <ResponsivePie
    data={data}
    margin={{
        "top": 10,
        "right": 10,
        "bottom": 80,
        "left": 10
    }}
    startAngle={-180}
    endAngle={280}
    innerRadius={0}
    padAngle={0.7}
    cornerRadius={3}
    colors="dark2"
    colorBy={function (e) { return e.color }}
    //colorBy="id"
    borderWidth={0}
    borderColor="inherit:darker(0.2)"
    enableRadialLabels={false}
    slicesLabelsSkipAngle={10}
    slicesLabelsTextColor="#333333"
    animate={true}
    motionStiffness={90}
    motionDamping={15}
    
    defs={[
        {
            "id": "dots",
            "type": "patternDots",
            "background": "inherit",
            "color": "rgba(255, 255, 255, 0.3)",
            "size": 4,
            "padding": 1,
            "stagger": true
        },
        {
            "id": "lines",
            "type": "patternLines",
            "background": "inherit",
            "color": "rgba(255, 255, 255, 0.3)",
            "rotation": -45,
            "lineWidth": 6,
            "spacing": 10
        }
		]}
		theme={{
			legends: {
				text: {
					fill: theme.palette.primary.light
				}
			},
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
    legends={[
        {
            "anchor": "bottom",
            "direction": "row",
            "translateY": 56,
            "itemWidth": 100,
            "itemHeight": 18,
            "symbolSize": 18,
            "symbolShape": "circle",
            "textColor": theme.palette.primary.light
        }
    ]}
  />

}
