import React, { Component } from 'react'
import { toSnakeCase } from '../../shared/caseConverter'
import serialize from 'form-serialize'
import FieldRenderer, {
  gridClasses
} from '../../components/forms/FieldRenderer'
import Button from '../../components/Button'
import Hints from '../../shared/Hints'

export default class SettingsForm extends Component {
  constructor (props) {
    super(props)
    this.state = {
      selected: 0,
      data: {},
      errors: {}
    }
  }

  tabs = () => {
    var b = []
    return b
  };

  onSubmitHandler = (e) => {
    e.preventDefault()
    const serializedData = serialize(this.formRef, {
      hash: true,
      empty: true
    })
    const data = toSnakeCase(serializedData)
    this.props.update(data)
  };

  render () {
    return (
      <div className="py-4">
        <form
          name="create-repo"
          onSubmit={this.onSubmitHandler.bind(this)}
          ref={(form) => {
            this.formRef = form
          }}
        >

          {
            this.props.hint && <Hints type={this.props.hint}/>
          }

          <p
            className="text-lg leading-6 font-medium
                text-gray-900 py-4"
          >
            {this.props.title}
          </p>

          <div className="flex flex-wrap">
            {this.props.definitions().map((field, index) => {
              return (
                <div
                  key={`field-${field.name}-${index}`}
                  className={`${gridClasses(field)} py-2 pr-2`}
                  {...field.gridProps}
                >
                  <FieldRenderer
                    {...field}
                    namespace={'app'}
                    data={field}
                    props={this.props}
                    errors={this.props.data.errors || {}}
                  />
                </div>
              )
            })}
          </div>

          <div className="flex">
            <div className=" w-full sm:w-1/2">
              <Button
                variant="success"
                color="primary"
                size="md"
                type="submit">
                {I18n.t('common.save')}
              </Button>
            </div>
          </div>
        </form>
      </div>
    )
  }
}
