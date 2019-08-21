import React, {Component} from 'react'
import FieldRenderer from '../../shared/FormFields'
import {
  Grid,
  Button
} from '@material-ui/core'

import {toSnakeCase} from '../../shared/caseConverter'
import serialize from 'form-serialize'

const SettingsForm = ({app, data, errors, updateData}) => {

  let formRef 

  const definitions = () => {
    return [
      {
        name: "title",
        hint: "documentation site subdomain",
        type: 'string',
        grid: { xs: 12, sm: 12 }
      },
      {
        name: "website",
        hint: "link to your website",
        type: 'string',
        grid: { xs: 12, sm: 12 }
      },
    ]
  }

  const handleUpdateData = (params, cb) => {
    const newData = Object.assign({}, data, params)
    updateData(newData) //, cb ? cb() : null)
  }

  const onSubmitHandler = ()=>{
    const serializedData = serialize(formRef, { hash: true, empty: true })
    handleUpdateData(serializedData.bot_task)
  }

  return <form ref={(ref)=> formRef = ref }>
          <Grid container spacing={3}>
                {
                  definitions().map((field) => {

                    return <Grid item
                              key={field.name} 
                              xs={field.grid.xs} 
                              sm={field.grid.sm}>
                              <FieldRenderer 
                                namespace={'bot_task'} 
                                data={field}
                                //errorNamespace={this.props.errorNamespace}
                                props={{data: data }} 
                                errors={ errors }
                              />
                          </Grid>
                  })
                }
              </Grid>


              <Grid container justify={"space-around"}>

              <Button appearance="subtle" variant={"outlined"}>
                Cancel
              </Button>

              <Button 
                onClick={onSubmitHandler}
                variant="contained" 
                color="primary">
                Save
              </Button>
            </Grid>
        
        </form>
  


}

export default SettingsForm