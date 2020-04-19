import React, { Component } from "react";
import Tooltip from "rc-tooltip";
import FormDialog from "../FormDialog";
import DataTable from "../Table";
import SegmentItemButton from "./itemButton";
import { Map, List, fromJS } from "immutable";
import Dropdown from "../Dropdown";
import { ButtonIndigo } from "../Button";

//import ClickAwayListener  from '@material-ui/core/ClickAwayListener'

import defaultFields from "../../shared/defaultFields";

import styled from "@emotion/styled";

import { withRouter } from "react-router-dom";
import { connect } from "react-redux";

import { SaveIcon, DeleteIcon, AddIcon, PlusIcon } from "../icons";

const ButtonGroup = styled.div`
  //display: inline-flex;
  //display: -webkit-box;

  margin-bottom: 2em;

  display: inline-flex;
  flex-wrap: wrap;

  button {
    margin-right: 5px !important;
    margin: 2px;
  }
`;

function Spinner() {
  return <p>run run run...</p>;
}

export class SaveSegmentModal extends Component {
  state = {
    isOpen: false,
    action: "update",
    loading: false,
    input: null,
  };
  open = () => this.setState({ isOpen: true });
  close = () => this.setState({ isOpen: false });
  input_ref = null;

  secondaryAction = ({ target }) => {
    this.props.savePredicates(
      {
        action: this.state.action,
        input: this.input_ref ? this.input_ref.value : null,
      },
      () => {
        this.close();
        if (this.props.predicateCallback) this.props.predicateCallback();
      }
    );
  };

  deleteAction = ({ target }) => {
    this.props.deleteSegment(this.props.segment.id, this.close);
  };

  handleChange = ({ target }) => {
    this.setState({
      action: target.value,
    });
  };

  equalPredicates = () => {
    return fromJS(this.props.segment.predicates).equals(
      fromJS(this.props.segment.initialPredicates)
    );
  };

  incompletePredicates = () => {
    return this.props.segment.predicates.find((o) => !o.comparison || !o.value);
  };

  render() {
    const { isOpen, loading } = this.state;

    return (
      <React.Fragment>
        <div className="flex items-center">
          <Tooltip placement="bottom" overlay={"Save Segment"}>
            <ButtonIndigo
              isLoading={false}
              arial-label={"Save Segment"}
              variant={"icon"}
              appearance={"link"}
              onClick={this.open}
              disabled={this.equalPredicates() || this.incompletePredicates()}
            >
              <SaveIcon variant="small" />{" "}
            </ButtonIndigo>
          </Tooltip>

          <Tooltip placement="bottom" overlay={"Delete Segment"}>
            <ButtonIndigo
              isLoading={false}
              variant={"clean"}
              arial-label={"Delete segment"}
              appearance={"link danger"}
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
            //contentText={"lipsum"}
            titleContent={"Save Segment"}
            formComponent={
              !loading ? (
                <div>
                  <p className="text-sm leading-5 text-gray-500">
                    The changes will be saved to the app segments.
                  </p>

                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      className="form-radio h-4 w-4 text-indigo-600 transition duration-150 ease-in-out"
                      name="options"
                      value={"update"}
                      onChange={this.handleChange.bind(this)}
                    />
                    <span className="ml-2">
                      Save changes to the <b>{this.props.segment.name}</b>{" "}
                      segment.
                    </span>
                  </label>

                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      className="form-radio h-4 w-4 text-indigo-600 transition duration-150 ease-in-out"
                      name="options"
                      value={"new"}
                      onChange={this.handleChange.bind(this)}
                    />
                    <span className="ml-2">Create new segment</span>
                  </label>

                  {this.state.action === "new" && (
                    <input
                      className="mt-1 form-input block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:shadow-outline-blue focus:border-blue-300 transition duration-150 ease-in-out sm:text-sm sm:leading-5"
                      autoFocus
                      margin="dense"
                      id="name"
                      name="name"
                      label="name"
                      type="email"
                      fullWidth
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
                <button
                  className="inline-flex justify-center w-full rounded-md border border-transparent px-4 py-2 bg-red-600 text-base leading-6 font-medium text-white shadow-sm hover:bg-red-500 focus:outline-none focus:border-red-700 focus:shadow-outline-red transition ease-in-out duration-150 sm:text-sm sm:leading-5"
                  onClick={this.secondaryAction.bind(this)}
                  color="primary"
                >
                  {this.state.action === "update" ? "Save" : "Save New"}
                </button>

                <button
                  onClick={this.close}
                  className="inline-flex justify-center w-full rounded-md border border-gray-300 px-4 py-2 bg-white text-base leading-6 font-medium text-gray-700 shadow-sm hover:text-gray-500 focus:outline-none focus:border-blue-300 focus:shadow-outline transition ease-in-out duration-150 sm:text-sm sm:leading-5"
                  color="secondary"
                >
                  Cancel
                </button>
              </React.Fragment>
            }
            //actions={actions}
            //onClose={this.close}
            //heading={this.props.title}
          ></FormDialog>
        )}
      </React.Fragment>
    );
  }
}

export class InlineFilterDialog extends Component {
  state = {
    dialogOpen: false,
  };

  _my_field = null;

  toggleDialog = (e) =>
    this.setState({
      dialogOpen: !this.state.dialogOpen,
    });

  handleClick = (e, o) => {
    this.setState(
      {
        dialogOpen: !this.state.dialogOpen,
      },
      () => {
        this.props.addPredicate(o, (token) => {
          //this.props.handleClick(token)
        });
      }
    );
  };

  toggleDialog2 = () => {
    this.setState({ dialogOpen: !this.state.dialogOpen });
  };

  availableFields = () => {
    if (!this.props.app.customFields) return defaultFields;
    return this.props.app.customFields.concat(defaultFields);
  };

  render() {
    const fields = this.availableFields();

    // <ClickAwayListener onClickAway={this.toggleDialog2.bind(this)}>
    //  </ClickAwayListener>
    const content = (
      <div className="p-2">
        <h2 className="text-sm leading-5 font-medium text-gray-900">
          Select fields:
        </h2>

        <div className="overflow-scroll h-48">
          <ul>
            {fields.map((o) => (
              <li className="p-2 border-b">
                <button
                  className="inline-flex justify-center w-full rounded-md border border-transparent px-1 py-1 bg-indigo-600 text-base leading-6 font-medium text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus:border-indigo-700 focus:shadow-outline-indigo transition ease-in-out duration-150 sm:text-sm sm:leading-5"
                  key={o.name}
                  onClick={(e) => this.handleClick.bind(this)(e, o)}
                >
                  {o.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );

    return (
      <div>
        <Dropdown
          isOpen={this.state.dialogOpen}
          triggerButton={(cb) => (
            <button
              innerRef={(ref) => (this._my_field = ref)}
              isLoading={false}
              className="p-2 inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs leading-4 font-medium rounded text-white bg-gray-600 hover:bg-gray-500 focus:outline-none focus:border-indigo-700 focus:shadow-outline-indigo active:bg-indigo-700 transition ease-in-out duration-150"
              variant="outlined"
              color="primary"
              onClick={cb}
            >
              <PlusIcon variant="small" /> Add filters
            </button>
          )}
        >
          {content}
        </Dropdown>
      </div>
    );
  }
}

class SegmentManager extends Component {
  constructor(props) {
    super(props);
  }

  handleClickOnSelectedFilter = (jwtToken) => {
    const url = `/apps/${this.props.app.key}/segments/${this.props.store.segment.id}/${jwtToken}`;
    this.props.history.push(url);
  };

  getTextForPredicate = (o) => {
    if (o.type === "match") {
      return `Match ${o.value === "and" ? "all" : "any"} criteria`;
    } else {
      return `Match: ${o.attribute} ${o.comparison ? o.comparison : ""} ${
        o.value ? o.value : ""
      }`;
    }
  };

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
                appearance={o.comparison ? "primary" : "default"}
                text={this.getTextForPredicate(o)}
                updatePredicate={this.props.updatePredicate}
                deletePredicate={this.props.deletePredicate}
              />
            );
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
            title={"segment"}
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
    );
  }
}

function mapStateToProps(state) {
  const { app } = state;
  return {
    app,
  };
}

export default withRouter(connect(mapStateToProps)(SegmentManager));
