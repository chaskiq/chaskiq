import React, { Component } from 'react'
import Tooltip from 'rc-tooltip'
import FormDialog from '../FormDialog'
import DataTable from '../Table'
import SegmentItemButton from './itemButton'
import { fromJS } from 'immutable'
import Dropdown from '../Dropdown'
import Button, { ButtonIndigo } from '../Button'

// import ClickAwayListener  from '@material-ui/core/ClickAwayListener'

import defaultFields from  '../../utils/defaultFields'

import styled from '@emotion/styled'

import { withRouter } from 'react-router-dom'
import { connect } from 'react-redux'

import { SaveIcon, DeleteIcon, PlusIcon } from '../icons'

const ButtonGroup = styled.div`
  //display: inline-flex;
  //display: -webkit-box;

  margin-bottom: 2em;

  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  button {
    margin-right: 5px !important;
    margin: 2px;
  }
`

function Spinner() {
  return <p>run run run...</p>
}

export class SaveSegmentModal extends Component {
  state = {
    isOpen: false,
    action: 'update',
    loading: false,
    input: null,
  }

  open = () => this.setState({ isOpen: true })
  close = () => this.setState({ isOpen: false })
  input_ref = null

  secondaryAction = ({ _target }) => {
    this.props.savePredicates(
      {
        action: this.state.action,
        input: this.input_ref ? this.input_ref.value : null,
      },
      () => {
        this.close()
        if (this.props.predicateCallback) this.props.predicateCallback()
      }
    )
  }

  deleteAction = ({ _target }) => {
    this.props.deleteSegment(this.props.segment.id, this.close)
  }

  handleChange = ({ target }) => {
    this.setState({
      action: target.value,
    })
  }

  equalPredicates = () => {
    return fromJS(this.props.segment.predicates).equals(
      fromJS(this.props.segment.initialPredicates)
    )
  }

  incompletePredicates = () => {
    return this.props.segment.predicates.find((o) => !o.comparison || !o.value)
  }

  render() {
    const { isOpen, loading } = this.state

    return (
      <React.Fragment>
        <div className="flex items-center">
          <Tooltip
            placement="bottom"
            overlay={I18n.t('segment_manager.save_segment')}
          >
            <ButtonIndigo
              isLoading={false}
              arial-label={I18n.t('segment_manager.save_segment')}
              variant={'icon'}
              onClick={this.open}
              size={'small'}
              disabled={this.equalPredicates() || this.incompletePredicates()}
            >
              <SaveIcon variant="small" />{' '}
            </ButtonIndigo>
          </Tooltip>

          <Tooltip
            placement="bottom"
            overlay={I18n.t('segment_manager.delete_segment')}
          >
            <ButtonIndigo
              isLoading={false}
              variant={'icon'}
              arial-label={I18n.t('segment_manager.delete_segment')}
              appearance={'link danger'}
              onClick={this.deleteAction.bind(this)}
            >
              <DeleteIcon />
            </ButtonIndigo>
          </Tooltip>
        </div>

        {isOpen && (
          <FormDialog
            open={isOpen}
            handleClose={this.close}
            // contentText={"lipsum"}
            titleContent={I18n.t('segment_manager.save_segment')}
            formComponent={
              !loading ? (
                <div>
                  <p className="text-sm leading-5 text-gray-500">
                    {I18n.t('segment_manager.changes_notice')}
                  </p>

                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      className="form-radio h-4 w-4 text-indigo-600 transition duration-150 ease-in-out"
                      name="options"
                      value={'update'}
                      onChange={this.handleChange.bind(this)}
                    />
                    <span className="ml-2">
                      {I18n.t('segment_manager.save_changes_to', {
                        name: this.props.segment.name,
                      })}
                    </span>
                  </label>

                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      className="form-radio h-4 w-4 text-indigo-600 transition duration-150 ease-in-out"
                      name="options"
                      value={'new'}
                      onChange={this.handleChange.bind(this)}
                    />
                    <span className="ml-2">
                      {I18n.t('segment_manager.create_segment')}
                    </span>
                  </label>

                  {this.state.action === 'new' && (
                    <input
                      className="mt-1 form-input block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:shadow-outline-blue focus:border-blue-300 transition duration-150 ease-in-out sm:text-sm sm:leading-5"
                      autoFocus
                      margin="dense"
                      id="name"
                      name="name"
                      label="name"
                      type="email"
                      ref={(input) => (this.input_ref = input)}
                    />
                  )}
                </div>
              ) : (
                <Spinner />
              )
            }
            dialogButtons={
              <React.Fragment>
                <Button
                  size="xs"
                  // className="inline-flex justify-center w-full rounded-md border border-transparent px-4 py-2 bg-red-600 text-base leading-6 font-medium text-white shadow-sm hover:bg-red-500 focus:outline-none focus:border-red-700 focus:shadow-outline-red transition ease-in-out duration-150 sm:text-sm sm:leading-5"
                  onClick={this.secondaryAction.bind(this)}
                  variant={'success'}
                >
                  {this.state.action === 'update' ? 'Save' : 'Save New'}
                </Button>

                <Button
                  size="xs"
                  onClick={this.close}
                  // className="inline-flex justify-center w-full rounded-md border border-gray-300 px-4 py-2 bg-white text-base leading-6 font-medium text-gray-700 shadow-sm hover:text-gray-500 focus:outline-none focus:border-blue-300 focus:shadow-outline transition ease-in-out duration-150 sm:text-sm sm:leading-5"
                  variant={'outlined'}
                >
                  {I18n.t('common.cancel')}
                </Button>
              </React.Fragment>
            }
            // actions={actions}
            // onClose={this.close}
            // heading={this.props.title}
          ></FormDialog>
        )}
      </React.Fragment>
    )
  }
}

export function InlineFilterDialog({ addPredicate, app, fields }) {
  const [dialogOpen, setDialogOpen] = React.useState(false)

  const handleClick = (e, o) => {
    addPredicate(o, (_token) => {
      // this.props.handleClick(token)
      setDialogOpen(false)
    })
  }

  const availableFields = () => {
    if (fields) return fields
    if (!app.customFields) return defaultFields
    return app.customFields.concat(defaultFields)
  }

  const f = availableFields()

  const content = (
    <div className="p-2--">
      <div className="p-2">
        <h2 className="text-sm leading-5 text-gray-900 dark:text-gray-100 font-bold">
          {I18n.t('segment_manager.select_fields')}
        </h2>
      </div>

      <div className="overflow-scroll h-48">
        <ul className="divide-y divide-gray-200">
          {f.map((o, i) => (
            <li key={`select-fields-${i}`}>
              <a
                key={o.name}
                onClick={(e) => handleClick(e, o)}
                className="cursor-pointer block hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:bg-gray-100 dark:focus:text-gray-800 transition duration-150 ease-in-out"
              >
                <div className="flex items-center px-4 py-4 sm:px-6">
                  <span className="flex items-center text-sm leading-5 text-gray-700 dark:text-gray-100">
                    {o.name}
                  </span>
                </div>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )

  return (
    <div>
      <Dropdown
        isOpen={dialogOpen}
        onOpen={(v) => setDialogOpen(v)}
        triggerButton={(cb) => (
          <Button
            isLoading={false}
            variant="success"
            className="flex flex-wrap"
            color="primary"
            size="sm"
            onClick={cb}
          >
            <PlusIcon variant="small" /> {I18n.t('segment_manager.add_filters')}
          </Button>
        )}
      >
        {content}
      </Dropdown>
    </div>
  )
}

class SegmentManager extends Component {
  constructor(props) {
    super(props)
  }

  handleClickOnSelectedFilter = (jwtToken) => {
    const url = `/apps/${this.props.app.key}/segments/${this.props.store.segment.id}/${jwtToken}`
    this.props.history.push(url)
  }

  getTextForPredicate = (o) => {
    if (o.type === 'match') {
      return `${I18n.t('segment_manager.match')} ${
        o.value === 'and'
          ? I18n.t('segment_manager.all')
          : I18n.t('segment_manager.any')
      } ${I18n.t('segment_manager.criteria')}`
    } else {
      return `Match: ${o.attribute} ${o.comparison ? o.comparison : ''} ${
        o.value ? o.value : ''
      }`
    }
  }

  render() {
    // this.props.actions.getPredicates()
    return (
      <div mt={2}>
        <ButtonGroup>
          {this.props.predicates.map((o, i) => {
            return (
              <SegmentItemButton
                key={i}
                index={i}
                predicates={this.props.predicates}
                predicate={o}
                open={!o.comparison}
                appearance={o.comparison ? 'primary' : 'default'}
                text={this.getTextForPredicate(o)}
                updatePredicate={this.props.updatePredicate}
                deletePredicate={this.props.deletePredicate}
              />
            )
          })}

          <InlineFilterDialog
            {...this.props}
            app={this.props.app}
            addPredicate={this.props.addPredicate}
            handleClick={this.handleClickOnSelectedFilter.bind(this)}
          />

          {this.props.children}
        </ButtonGroup>

        {
          <DataTable
            title={'segment'}
            meta={this.props.meta}
            data={this.props.collection}
            search={this.props.search}
            loading={this.props.loading}
            columns={this.props.columns}
            defaultHiddenColumnNames={this.props.defaultHiddenColumnNames}
            tableColumnExtensions={this.props.tableColumnExtensions}
            leftColumns={this.props.leftColumns}
            rightColumns={this.props.rightColumns}
            toggleMapView={this.props.toggleMapView}
            map_view={this.props.map_view}
            enableMapView={this.props.enableMapView}
          />
        }
      </div>
    )
  }
}

function mapStateToProps(state) {
  const { app } = state
  return {
    app,
  }
}

export default withRouter(connect(mapStateToProps)(SegmentManager))
