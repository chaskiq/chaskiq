import React from 'react'
import Tabs from '../components/Tabs'

export default function ScrollableTabsButtonForce ({ tabs, changeHandler }) {
  const [value, setValue] = React.useState(0)

  function handleChange (newValue) {
    setValue(newValue)
    changeHandler(newValue)
  }

  return (
    <div>
      <div>
        <Tabs
          value={value}
          onChange={handleChange}
          variant="scrollable"
          scrollButtons="on"
          indicatorColor="primary"
          textColor="primary"
          // aria-label="scrollable force tabs example"
          // className={classes.tabs}
          // classes={{indicator: classes.indicator }}
          tabs={tabs}
        >
          {/*
            tabs.map((o)=> <Tab
                            key={o.value}
                            label={o.label}
                            />)
          */}
        </Tabs>
      </div>
    </div>
  )
}
