import React from "react"
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'

function EmptyView({title, subtitle, icon}){
  return (

      <div style={{alignSelf: 'center'}}>
        <Paper style={{padding: '2em'}}>

          {icon && icon}
          <Typography variant="h2">
            {title} 
          </Typography>

          <Typography component="p">
            {subtitle}
          </Typography>

        </Paper>
      </div>
  )
}

export default EmptyView