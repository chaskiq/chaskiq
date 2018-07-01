import React, { Component } from 'react'
import { ResponsivePie } from '@nivo/pie'

// make sure parent container have a defined height when using responsive component,
// otherwise height will be 0 and no chart will be rendered.
// website examples showcase many properties, you'll often use just a few of them.

export default class CampaignPie extends Component {

  render(){
    return <ResponsivePie
        data={this.props.data}
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
        colors="nivo"
        colorBy="id"
        borderWidth={1}
        borderColor="inherit:darker(0.2)"
        enableRadialLabels={false}
        slicesLabelsSkipAngle={10}
        slicesLabelsTextColor="#333333"
        animate={true}
        motionStiffness={90}
        motionDamping={15}
        theme={{
            "tooltip": {
                "container": {
                    "fontSize": "13px"
                }
            },
            "labels": {
                "textColor": "#555"
            }
        }}
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
        /*
        fill={[
            {
                "match": {
                    "id": "ruby"
                },
                "id": "dots"
            },
            {
                "match": {
                    "id": "c"
                },
                "id": "dots"
            },
            {
                "match": {
                    "id": "go"
                },
                "id": "dots"
            },
            {
                "match": {
                    "id": "python"
                },
                "id": "dots"
            },
            {
                "match": {
                    "id": "scala"
                },
                "id": "lines"
            },
            {
                "match": {
                    "id": "lisp"
                },
                "id": "lines"
            },
            {
                "match": {
                    "id": "elixir"
                },
                "id": "lines"
            },
            {
                "match": {
                    "id": "javascript"
                },
                "id": "lines"
            }
        ]}*/
        legends={[
            {
                "anchor": "bottom",
                "direction": "row",
                "translateY": 56,
                "itemWidth": 100,
                "itemHeight": 18,
                "symbolSize": 18,
                "symbolShape": "circle"
            }
        ]}
      />

  }
}