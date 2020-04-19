import React, { Component } from "react";

import Button from "../../components/Button";

import { isEmpty } from "lodash";
import axios from "axios";
import serialize from "form-serialize";

import graphql from "../../graphql/client";
import { UPDATE_CAMPAIGN, CREATE_CAMPAIGN } from "../../graphql/mutations";

import FieldRenderer, {gridClasses} from "../../components/forms/FieldRenderer";

import { toSnakeCase } from "../../shared/caseConverter";
//import moment from 'moment-timezone';

export default class CampaignSettings extends Component {
  constructor(props) {
    super(props);
    //console.log(props)
    this.state = {
      eventResult:
        "Click into and out of the input above to trigger onBlur & onFocus in the Fieldbase",
      data: this.props.data,
      errors: {},
    };

    //window.tz = moment.tz
  }

  formRef;

  // Footer Button Handlers
  submitClickHandler = () => {
    this.formRef.submit();
  };

  onSubmitHandler = (e) => {
    e.preventDefault();
    const serializedData = serialize(this.formRef, { hash: true, empty: true });
    let data = toSnakeCase(serializedData).campaign;

    this.props.match.params.id === "new"
      ? this.create(data)
      : this.update(data);
  };

  // Form Event Handlers
  create = (data) => {
    graphql(
      CREATE_CAMPAIGN,
      {
        appKey: this.props.app.key,
        mode: this.props.mode,
        operation: "create",
        campaignParams: data,
      },
      {
        success: (data) => {
          this.setState(
            {
              data: data.campaignCreate.campaign,
              errors: data.campaignCreate.errors,
            },
            () => {
              if (!isEmpty(this.state.errors)) {
                return;
              }

              this.props.history.push(
                `/apps/${this.props.app.key}/messages/${this.props.mode}/${this.state.data.id}`
              );
              this.props.updateData(this.state.data);
            }
          );
        },
      }
    );
  };

  // Form Event Handlers
  update = (data) => {
    const params = {
      appKey: this.props.app.key,
      id: this.state.data.id,
      campaignParams: data,
    };

    graphql(UPDATE_CAMPAIGN, params, {
      success: (data) => {
        const result = data.campaignUpdate;
        this.setState({ data: result.campaign, errors: result.errors }, () => {
          this.props.updateData(result.campaign);
          this.props.successMessage();
        });
      },
      error: (error) => {},
    });
  };

  render() {
    return (
      <div container direction={"column"}>
        <form
          name="create-repo"
          onSubmit={this.onSubmitHandler.bind(this)}
          ref={(form) => {
            this.formRef = form;
          }}
        >
          <h3 className="text-xl font-bold my-4">
            {this.state.data.id
              ? "Edit Campaign Settings"
              : "Create a new campaign"}
          </h3>

          <div className="flex flex-wrap">
            {this.state.data.configFields.map((field) => {
              return (
                <div 
                  className={`${gridClasses(field)} py-2 pr-2`}>
                  <FieldRenderer
                    namespace={"campaign"}
                    data={field}
                    type={field.type}
                    props={this.state}
                    errors={this.state.errors}
                  />
                </div>
              );
            })}

            <div className="flex justify-end">
              <Button
                className="mr-2 p-4"
                onClick={this.onSubmitHandler.bind(this)}
                variant="contained"
                color="primary"
              >
                Save
              </Button>

              <Button appearance="subtle p-4">Cancel</Button>
            </div>
          </div>
        </form>
      </div>
    );
  }
}
