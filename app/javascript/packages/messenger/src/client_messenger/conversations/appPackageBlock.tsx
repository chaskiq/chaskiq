import React, { Component } from 'react';
import { DefinitionRenderer } from '@chaskiq/components/src/components/packageBlocks/components';
import Button from '@chaskiq/components/src/components/Button';
import { toCamelCase } from '@chaskiq/components/src/utils/caseConverter';
import autolink from '../autolink';
import serialize from 'form-serialize';
import { isEmpty } from 'lodash';
import {
  AppPackageBlockContainer,
  AppPackageBlockButtonItem,
  AppPackageBlockTextItem,
  DisabledElement,
} from '../styles/styled';

export default class AppPackageBlock extends Component {
  form = null;

  state = {
    value: null,
    errors: {},
    loading: false,
    schema: this.props.message.message.blocks.schema,
    submiting: false,
  };

  setLoading = (val) => {
    this.setState({ loading: val });
  };

  handleStepControlClick = (item) => {
    if (
      this.props.message.message.data &&
      this.props.message.message.data.opener
    ) {
      return window.open(this.props.message.message.data.opener);
    }

    this.setState({ submiting: true }, () => {
      this.props.clickHandler(item, this.props.message);
    });
  };

  sendAppPackageSubmit = (data, cb) => {
    // if(data.field.action && data.field.action.type === 'frame')
    //  this.props.clickHandler(data, this.props)
    this.updatePackage(data, this.props.message, cb);
  };

  updatePackage = (data, message, cb) => {
    if (data.field.action.type === 'url') {
      return window.open(data.field.action.url, '_blank');
    }

    if (data.field.action.type === 'frame') {
      // todo: handle get package :eyes
      this.props.displayAppBlockFrame({
        message: message,
        data: {
          field: data.field,
          id: message.message.blocks.app_package,
          values: message.message.blocks.values,
          message_key: message.key,
          conversation_key: this.props.conversation.key,
        },
      });
      cb && cb();
      return;
    }

    const camelCasedMessage = toCamelCase(message.message);

    const params = {
      id: camelCasedMessage.blocks.appPackage,
      hooKind: data.field.action.type,
      ctx: {
        field: data.field,
        conversation_key: this.props.conversation.key,
        message_key: message.key,
        definitions: camelCasedMessage.blocks.schema,
        step: this.props.stepId,
        trigger: this.props.triggerId,
        values: data.values || message.message.blocks.values,
      },
    };

    // handle steps on appPackageSubmitHandler
    this.props.getPackage(params, (data, updateMessage) => {
      if (!data) {
        return cb && cb();
      }

      const {
        definitions,
        _kind,
        results,
      } = data.messenger.app.appPackage.callHook;

      if (!results) {
        // this.setState({schema: definitions}, cb && cb())
      } else {
        // this will hit messenger_events#receive_conversation_part
        this.props.appPackageSubmitHandler(
          {
            submit: results,
            definitions: definitions,
          },
          message
        );
        // independly on the result of appPackageSubmit
        // we will update the state definitions on the block
        // maybe this will work on updating the message from ws ??
        // this.setState({schema: definitions}, cb && cb())
      }

      // update message from parent state
      const newMessage = this.props.message;
      newMessage.message.blocks.schema = definitions;
      updateMessage && updateMessage(newMessage);
      this.setState({ loading: false });
      cb && cb();
    });
  };

  // TODO: to be deprecated
  sendAppPackageSubmit2 = (e) => {
    if (this.state.loading) return;

    this.setLoading(true);

    e.preventDefault();

    const data = serialize(e.currentTarget, { hash: true, empty: true });
    let errors = {};

    // check custom functions and validate
    Object.keys(data).map((o) => {
      const item = this.props.searcheableFields.find((f) => f.name === o);
      if (!item) return;
      if (!item.validation) return;

      var args = ['value', item.validation];
      var validationFunc = Function.apply(null, args);
      const err = validationFunc(data[o]);
      if (!err) return;
      if (err.length === 0) return;
      errors = Object.assign(errors, { [o]: err });
    });

    this.setState({ errors: errors, loading: false }, () => {
      // console.log(this.state.errors)
      // console.log(isEmpty(this.state.errors) ? 'valid' : 'errors')
      if (!isEmpty(this.state.errors)) return;
      this.props.appPackageSubmitHandler(data, this.props.message);
    });
  };

  renderEmptyItem = () => {
    if (this.props.message.message.blocks.type === 'app_package') {
      return <p>{this.props.message.message.blocks.app_package} replied</p>;
    } else {
      return <p>mo</p>;
    }
  };

  renderDisabledElement = () => {
    const item = this.props.message.message.data;

    if (!item) return this.renderEmptyItem();

    switch (item.element) {
      case 'button':
        if (this.props.message.message.blocks.type === 'ask_option') {
          return (
            <span
              dangerouslySetInnerHTML={{
                __html: this.props.i18n.t(
                  'messenger.conversation_block.choosen',
                  {
                    field: item.label,
                  }
                ),
              }}
            />
          );
        }

      default:
        const message = this.props.message.message;
        const { blocks, data } = message;

        if (this.props.message.message.blocks.type === 'app_package') {
          return (
            <p>
              <strong>{blocks.app_package || blocks.appPackage}</strong>
              <br />
              {data && (
                <span
                  dangerouslySetInnerHTML={{
                    __html: data.formatted_text || data.formattedText,
                  }}
                />
              )}
            </p>
          );
        }

        if (this.props.message.message.blocks.type === 'data_retrieval') {
          return Object.keys(this.props.message.message.data).map((k) => {
            return (
              <p key={`data-retrieval-${k}`}>
                {k}: {this.props.message.message.data[k]}
              </p>
            );
          });
        }
      //else {
      //  <p>{JSON.stringify(this.props.message.message.data)}</p>
      //}

      // falls through
    }
  };

  // TODO: deprecate this in favor of appPackagesIntegration
  // has depency on buttons
  renderElement = (item, index) => {
    const element = item.element;
    const isDisabled =
      this.props.message.message.state === 'replied' || this.state.loading;
    const key = `${item.type}-${index}`;
    switch (element) {
      case 'separator':
        return <hr key={key} />;
      case 'input':
        const isEmailType = item.name === 'email' ? 'email' : null;
        const errorClass = this.state.errors[item.name] ? 'error' : '';
        return (
          <div
            style={{
              width: '100%',
              display: 'flex',
              justifyContent: 'center',
              padding: '1.2em',
            }}
            className={`form-group ${errorClass}`}
            key={key}
          >
            <label>
              {this.props.i18n.t('messenger.enter_your', { field: item.name })}
            </label>
            <input
              disabled={isDisabled}
              type={isEmailType || item.type}
              name={`submit[${item.name}]`}
              required
              placeholder={this.props.i18n.t('messenger.enter_your', {
                field: item.name,
              })}
              // onKeyDown={(e)=>{ e.keyCode === 13 ?
              //  this.handleStepControlClick(item) : null
              // }}
            />
            {this.state.errors[item.name] && (
              <span className="errors">
                {this.props.i18n.t('messenger.invalid', { name: item.name })}
              </span>
            )}
            <button
              disabled={isDisabled}
              key={key}
              style={{ alignSelf: 'flex-end' }}
              type={'submit'}
            >
              {this.props.i18n.t('messenger.submit')}
            </button>
          </div>
        );

      case 'submit':
        return (
          <Button
            disabled={isDisabled}
            key={key}
            style={{ alignSelf: 'flex-end' }}
            type={'submit'}
          >
            {this.props.i18n.t('messenger.submit')}
          </Button>
        );
      case 'button':
        return (
          <AppPackageBlockButtonItem>
            <Button
              // variant="outlined"
              disabled={isDisabled}
              onClick={() => this.handleStepControlClick(item)}
              key={key}
              type={'button'}
            >
              {item.label}
            </Button>
          </AppPackageBlockButtonItem>
        );
      default:
        return null;
    }
  };

  renderElements = () => {
    const isDisabled = this.props.message.message.state === 'replied';
    if (isDisabled) {
      return <DisabledElement>{this.renderDisabledElement()}</DisabledElement>;
    }
    return (
      <div className="elementsContainer">
        {this.props.message.message.blocks.label && (
          <AppPackageBlockTextItem
            dangerouslySetInnerHTML={{
              __html: autolink(this.props.message.message.blocks.label),
            }}
          />
        )}

        {this.props.message.message.blocks.schema.map((o, i) =>
          this.renderElement(o, i)
        )}
      </div>
    );
  };

  isHidden = () => {
    // will hide this kind of message since is only a placeholder from bot
    return this.props.message.message.blocks.type === 'wait_for_reply';
  };

  render() {
    const blocks = this.props.message.message.blocks;
    return (
      <AppPackageBlockContainer
        isInline={this.props.isInline}
        isHidden={this.isHidden()}
      >
        {blocks.type === 'app_package' && (
          <DefinitionRenderer
            // schema={this.state.schema}
            schema={blocks.schema}
            updatePackage={(data, cb) => this.sendAppPackageSubmit(data, cb)}
          />
        )}

        {blocks.type !== 'app_package' && (
          <form
            ref={(o) => (this.form = o)}
            className="form"
            onSubmit={this.sendAppPackageSubmit2}
          >
            <fieldset disabled={this.state.submiting ? 'disabled' : ''}>
              {this.renderElements()}
            </fieldset>
          </form>
        )}
      </AppPackageBlockContainer>
    );
  }
}
