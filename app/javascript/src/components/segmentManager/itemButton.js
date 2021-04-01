// same as SegmentItemButton

import React, { Component } from 'react'
import styled from '@emotion/styled'
import Dropdown from '../Dropdown'
import Button from '../Button'

const h2 = styled.h5`
  margin: 15px;
  border-bottom: 2px dotted #6f6f6f26;
`

const ContentMatch = styled.div`
  height: 200px;
`

const ContentMatchFooter = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-evenly;
  position: absolute;
  bottom: 1px;
  padding: 1em;
  width: 100%;
`

const div = styled.div`
  margin-bottom: 3em;
`

export default class SegmentItemButton extends Component {
  state = {
    dialogOpen: this.props.open,
    selectedOption: this.props.predicate.comparison,
    checkedValue: this.props.predicate.value,
    btn: null
  };

  relative_input = null;
  btn_ref = null;
  blockStyleRef = React.createRef();

  componentDidUpdate (prevProps) {
    if (this.props.predicate !== prevProps.predicate) {
      this.setState({
        selectedOption: this.props.predicate.comparison,
        checkedValue: this.props.predicate.value
      })
    }
  }

  handleInputScroll = (target, cb)=>{
    setTimeout(() => {
      const el = this.blockStyleRef.current
      const diff =
        target.getBoundingClientRect().top - el.getBoundingClientRect().top
      this.blockStyleRef.current.scrollTop = diff
    }, 20)

    cb && cb()
  }

  onRadioChange = (target, cb) => {
    const { value } = target
    this.setState(
      {
        selectedOption: value
      },
      () => { this.handleInputScroll(target, cb)}
    )
  };

  onRadioTypeChange = (target, o, cb) => {
    window.blockStyleRef = this.blockStyleRef.current
    window.target = target

    this.setState({
      checkedValue: target.value,
      selectedOption: o.value
    },
    () => { this.handleInputScroll(target, cb)}
    )
  };

  onCheckBoxTypeChange = (target, o, cb) => {
    let newArr = []
    if(!target.checked){
      newArr = this.state.checkedValue.filter((c)=> c !== o.label )
    }else{
      newArr = this.state.checkedValue.concat(o.label)
    }

    this.setState({
      checkedValue: newArr,
      selectedOption: o.value
    }, () => { this.handleInputScroll(target, cb)}
    )
  }

  handleSubmit = (_e) => {
    // this.props.predicate.type
    let value = null

    if (this.relative_input && !this.relative_input.value) { return this.toggleDialog2() }

    let comparison = this.state.selectedOption.replace('relative:', '')

    switch (this.props.predicate.type) {
      case 'string': {
        switch (this.props.predicate.attribute) {
          case 'type':
            // we assume here that this field is auto applied
            // todo: set radio button on mem and update only on apply click
            value = this.state.checkedValue
            comparison = 'in'
            break
          default:
            value = `${this.relative_input.value}`
            break
        }
        break
      }

      case 'integer': {
        value = this.relative_input.value
        break
      }

      case 'date': {
        value = `${this.relative_input.value} days ago`
        break
      }

      case 'match': {
        value = `${this.state.checkedValue}`
        comparison = `${this.state.checkedValue}`
        break
      }

      default:
        return null
    }

    const h = {
      comparison: comparison,
      value: value
    }

    const response = Object.assign({}, this.props.predicate, h)
    const new_predicates = this.props.predicates.map((o, i) =>
      this.props.index === i ? response : o
    )

    this.props.updatePredicate(new_predicates, this.props.predicateCallback)

    this.toggleDialog()
  };

  handleDelete = (_e) => {
    // const response = Object.assign({}, this.props.predicate, h )
    // const new_predicates = this.props.predicates.map((o, i)=> this.props.index === i ? response : o  )
    const data = this.props.predicates.filter((o, i) => i !== this.props.index)
    this.props.deletePredicate(data, this.props.predicateCallback)
  };

  renderOptions = () => {
    switch (this.props.predicate.type) {
      case 'string': {
        switch (this.props.predicate.attribute) {
          case 'type':
            return this.contentType()
          default:
            return this.contentString()
        }
      }

      case 'date': {
        return this.contentDate()
      }

      case 'integer': {
        return this.contentInteger()
      }

      case 'match': {
        return this.contentMatch()
      }

      default:
        return null
    }
  };

  toggleDialog2 = () => {
    this.setState({ dialogOpen: !this.state.dialogOpen })
  };

  contentType = () => {
    /*const compare = (value) => {
      return this.props.predicate.comparison === value
    }*/

    const relative = [
      { label: 'AppUser', value: 'AppUser', defaultSelected: false },
      { label: 'Lead', value: 'Lead', defaultSelected: false },
      { label: 'Visitor', value: 'Visitor', defaultSelected: false }
    ]

    return (
      <div>
        {
          <div className="p-2">
            <h2 className="text-sm leading-5 text-gray-900 font-bold">
              Select the filter for {this.props.predicate.attribute}
            </h2>
          </div>
        }

        <ContentMatch>
          <div ref={this.blockStyleRef} className="mt-2 p-2 h-32 overflow-scroll">
            {relative.map((o, i) => {
              return (
                <div key={`type-filter-${i}`}>
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      className="form-radio h-4 w-4 text-indigo-600 transition duration-150 ease-in-out"
                      name="options"
                      value={o.value}
                      checked={this.state.checkedValue.includes(o.value)}
                      onChange={(e) => {
                        this.onCheckBoxTypeChange(e.target, o)
                      }}
                    />
                    <span className="ml-2">{o.label}</span>
                  </label>
                </div>
              )
            })}
          </div>
        </ContentMatch>

        <ContentMatchFooter>
          {this.state.checkedValue &&
            (this.state.checkedValue !== 'is_null' ||
              this.state.checkedValue !== 'is_not_null') && (
            <Button
              size="small"
              onClick={this.handleSubmit.bind(this)}
            >
              Apply
            </Button>
          )}

          {/*this.deleteButton()*/}
        </ContentMatchFooter>
      </div>
    )
  };

  contentString = () => {
    const relative = [
      { label: 'is', value: 'eq', defaultSelected: false },
      { label: 'is not', value: 'not_eq', defaultSelected: false },
      { label: 'starts with', value: 'contains_start', defaultSelected: false },
      { label: 'ends with', value: 'contains_ends', defaultSelected: false },
      { label: 'contains', value: 'contains', defaultSelected: false },
      {
        label: 'does not contain',
        value: 'not_contains',
        defaultSelected: false
      },
      { label: 'is unknown', value: 'is_null', defaultSelected: false },
      { label: 'has any value', value: 'is_not_null', defaultSelected: false }
    ]

    return (
      <div>
        {
          <div className="p-2">
            <h2 className="text-sm leading-5 text-gray-900 font-bold">
              Select the filter for {this.props.predicate.attribute}
            </h2>
          </div>
        }

        <ContentMatch>
          <div ref={this.blockStyleRef} className="mt-2 p-2 h-32 overflow-scroll">
            {relative.map((o, i) => {
              return (
                <div key={`string-filter-${i}`}>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      className="form-radio h-4 w-4 text-indigo-600 transition duration-150 ease-in-out"
                      name="options"
                      value={o.value}
                      checked={o.value === this.state.selectedOption}
                      onChange={(e) => {
                        this.onRadioTypeChange(e.target, o)
                      }}
                    />
                    <span className="ml-2 block text-sm leading-5 font-medium text-gray-700">
                      {o.label}
                    </span>
                  </label>

                  {this.state.selectedOption &&
                    this.state.selectedOption === o.value && (
                    <div>
                      <input
                        type="text"
                        defaultValue={this.props.predicate.value}
                        ref={(input) => (this.relative_input = input)}
                        className={
                          'mb-3 p-1 border max-w-xs rounded-md shadow-sm form-input block w-full transition duration-150 ease-in-out sm:text-sm sm:leading-5'
                        }
                        label={'value'}
                        margin="normal"
                      />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </ContentMatch>

        <ContentMatchFooter>
          {this.state.selectedOption &&
            (this.state.selectedOption !== 'is_null' ||
              this.state.selectedOption !== 'is_not_null') && (
            <Button
              color="primary"
              size={'small'}
              onClick={this.handleSubmit.bind(this)}
            >
              Apply
            </Button>
          )}

          {this.deleteButton()}
        </ContentMatchFooter>
      </div>
    )
  };

  contentDate = () => {
    const compare = (value) => {
      return this.props.predicate.comparison === value
    }

    const relative = [
      { label: 'more than', value: 'lt', defaultSelected: compare('lt') },
      { label: 'exactly', value: 'eq', defaultSelected: compare('eq') },
      { label: 'less than', value: 'gt', defaultSelected: compare('gt') }
    ]

    /*const absolute = [
      { name: 'after', value: 'absolute:gt' },
      { name: 'on', value: 'absolute:eq' },
      { name: 'before', value: 'absolute:lt' },
      { name: 'is unknown', value: 'absolute:eq' },
      { name: 'has any value', value: 'absolute:not_eq' }
    ]*/

    const extractNum = this.props.predicate.value
      ? this.props.predicate.value.match(/\d+/)[0]
      : ''

    const parsedNum = parseInt(extractNum)

    return (
      <div className="p-2">
        <div>
          <h2 className="text-sm leading-5 text-gray-900 font-bold">
            Select the date filter for {this.props.predicate.attribute}
          </h2>
        </div>

        <ContentMatch>
          <div ref={this.blockStyleRef} className="mt-2 p-2 h-32 overflow-scroll">
            {relative.map((o, i) => {
              return (
                <div key={`date-filter-${i}`}>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      className="form-radio h-4 w-4 text-indigo-600 transition duration-150 ease-in-out"
                      name="options"
                      value={o.value}
                      checked={this.state.selectedOption === o.value}
                      onChange={(e) => {
                        this.onRadioChange(e.target)
                      }}
                    />
                    <span className="ml-2">{o.label}</span>
                  </label>

                  {this.state.selectedOption &&
                    this.state.selectedOption === o.value && (
                    <div className="mb-3 ">
                      <input
                        type="number"
                        defaultValue={isNaN(parsedNum) ? null : parsedNum }
                        ref={(input) => (this.relative_input = input)}
                        className={
                          'p-1 border max-w-xs rounded-md shadow-sm form-input block w-full transition duration-150 ease-in-out sm:text-sm sm:leading-5'
                        }
                        label={'value'}
                        margin="normal"
                      />
                      <span className="mt-1 text-sm leading-5 text-gray-500">
                          days ago
                      </span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </ContentMatch>

        <ContentMatchFooter>
          {this.state.selectedOption && (
            <Button
              color="primary"
              size={'small'}
              onClick={this.handleSubmit.bind(this)}
            >
              Apply
            </Button>
          )}

          {this.deleteButton()}
        </ContentMatchFooter>
      </div>
    )
  };

  contentInteger = () => {
    const compare = (value) => {
      return this.props.predicate.comparison === value
    }

    const relative = [
      { label: 'exactly', value: 'eq', defaultSelected: compare('eq') },
      { label: 'more than', value: 'gt', defaultSelected: compare('gt') },
      {
        label: 'more than eq',
        value: 'gteq',
        defaultSelected: compare('gteq')
      },
      { label: 'less than', value: 'lt', defaultSelected: compare('lt') },
      {
        label: 'less than eq',
        value: 'lteq',
        defaultSelected: compare('lteq')
      }
    ]

    const extractNum = this.props.predicate.value
      ? this.props.predicate.value.match(/\d+/)[0]
      : ''

    const parsedNum = parseInt(extractNum)

    return (
      <div className="p-2">
        <div>
          <h2 className="text-sm leading-5 text-gray-900 font-bold">
            Select the integer filter for {this.props.predicate.attribute}
          </h2>
        </div>

        <ContentMatch ref={this.blockStyleRef}>
          {relative.map((o, i) => {
            return (
              <div key={`filter-match-${i}`}>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    className="form-radio h-4 w-4 text-indigo-600 transition duration-150 ease-in-out"
                    name="options"
                    value={o.value}
                    checked={this.state.selectedOption === o.value}
                    onChange={(e) => {
                      this.onRadioTypeChange(e.target, o)
                    }}
                  />
                  <span className="ml-2">{o.label}</span>
                </label>

                {this.state.selectedOption &&
                  this.state.selectedOption === o.value && (
                  <div>
                    <input
                      type="text"
                      defaultValue={parsedNum || 0}
                      ref={(input) => (this.relative_input = input)}
                      className={
                        'mb-3 p-1 border max-w-xs rounded-md shadow-sm form-input block w-full transition duration-150 ease-in-out sm:text-sm sm:leading-5'
                      }
                      label={'value'}
                      margin="normal"
                    />
                  </div>
                )}
              </div>
            )
          })}

        </ContentMatch>

        <ContentMatchFooter>
          {this.state.selectedOption && (
            <Button
              color="primary"
              size={'small'}
              onClick={this.handleSubmit.bind(this)}
            >
              Apply
            </Button>
          )}

          {this.deleteButton()}
        </ContentMatchFooter>
      </div>
    )
  };

  contentMatch = () => {
    const compare = (value) => {
      return this.props.predicate.value === value
    }

    const relative = [
      {
        label: 'match any',
        comparison: 'or',
        value: 'or',
        defaultSelected: compare('or')
      },
      {
        label: 'match all',
        comparison: 'and',
        value: 'and',
        defaultSelected: compare('and')
      }
    ]

    return (
      <div className="p-2">
        <div>
          <h2 className="text-sm leading-5 text-gray-900 font-bold">
            match criteria options for {this.props.predicate.type}
          </h2>
        </div>

        <ContentMatch>
          <div ref={this.blockStyleRef} className="mt-2 p-2 h-32 overflow-scroll">
            {relative.map(
              (o, i) => {
                return (
                  <div key={`criteria-match-${i}`}>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        className="form-radio h-4 w-4 text-indigo-600 transition duration-150 ease-in-out"
                        name="options"
                        value={o.value}
                        checked={o.value === this.state.checkedValue}
                        onChange={(e) => {
                          this.onRadioTypeChange(e.target, o)
                        }}
                      />
                      <span className="ml-2">
                        {o.label}
                      </span>
                    </label>
                  </div>
                )
              })}
          </div>
        </ContentMatch>

        <ContentMatchFooter>
          { this.state.selectedOption &&
            (this.state.selectedOption !== 'is_null' ||
              this.state.selectedOption !== 'is_not_null') && (
            <Button
              color="primary"
              size={'small'}
              onClick={this.handleSubmit.bind(this)}
            >
                Apply
            </Button>
          )}
        </ContentMatchFooter>
      </div>
    )
  };

  deleteButton = () => {
    return (
      <Button
        size="small"
        variant="link"
        onClick={this.handleDelete.bind(this)}
      >
        Delete
      </Button>
    )
  };

  toggleDialog = (e) => {
    this.setState({
      dialogOpen: !this.state.dialogOpen,
      btn: e ? e.target : this.state.btn
    })
  }

  toggleDialog2 = () => {
    this.setState({
      dialogOpen: !this.state.dialogOpen
    })
  }

  closeDialog = () => {
    this.setState({
      dialogOpen: false
    })
  }

  openDialog = () => {
    this.setState({
      dialogOpen: true
    })
  }

  renderMenu = () => {
    // if(!this.btn_ref)
    //  return
    return this.renderOptions()
  };

  setRef = (ref) => {
    this.btn_ref = ref
  };

  render () {
    return (
      <div>
        {!this.props.predicate.comparison ? (
          <React.Fragment>
            <Dropdown
              isOpen={this.state.dialogOpen}
              labelButton={'Missing value!'}
              triggerButton={(cb) => (
                <Button
                  ref={(ref) => this.setRef(ref)}
                  isLoading={false}
                  size="small"
                  variant="outlined"
                  color={'secondary'}
                  onClick={cb}
                >
                  {/*
                      !this.state.dialogOpen ?
                        "Missing value!" :
                        this.props.text
                      */}

                  {'Missing value!'}
                </Button>
              )}
            >
              {this.renderMenu()}
            </Dropdown>
          </React.Fragment>
        ) : (
          <React.Fragment>
            <Dropdown
              isOpen={this.state.dialogOpen}
              triggerButton={(cb) => (
                <Button
                  // className="p-2 inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs leading-4 font-medium rounded text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:border-indigo-700 focus:shadow-outline-indigo active:bg-indigo-700 transition ease-in-out duration-150"
                  ref={(ref) => this.setRef(ref)}
                  isLoading={false}
                  color="primary"
                  size="small"
                  variant="outlined"
                  // appearance={this.props.appearance}
                  onClick={cb}
                >
                  {this.props.text}
                </Button>
              )}
            >
              {this.renderMenu()}
            </Dropdown>
          </React.Fragment>
        )}
      </div>
    )
  }
}
