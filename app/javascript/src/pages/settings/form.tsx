import React, { Component } from 'react';
import serialize from 'form-serialize';

import FieldRenderer, {
  gridClasses,
} from '@chaskiq/components/src/components/forms/FieldRenderer';
import Button from '@chaskiq/components/src/components/Button';
import Hints, { HintType } from '@chaskiq/components/src/components/Hints';
import { toSnakeCase } from '@chaskiq/components/src/utils/caseConverter';
import I18n from '../../shared/FakeI18n';

type SettingsFormType = {
  update: (data: any) => void;
  hint?: HintType;
  title?: string;
  classes?: string;
  definitions: any;
  data: {
    app?: any;
    errors?: any;
  };
};

type SettingsFormState = {
  selected: number;
  data: any;
  errors: any;
};
export default class SettingsForm extends Component<
  SettingsFormType,
  SettingsFormState
> {
  formRef = React.createRef<HTMLFormElement>();

  constructor(props) {
    super(props);
    this.state = {
      selected: 0,
      data: {},
      errors: {},
    };
  }

  tabs = () => {
    var b = [];
    return b;
  };

  onSubmitHandler = (e) => {
    e.preventDefault();
    const serializedData = serialize(this.formRef.current, {
      hash: true,
      empty: true,
    });
    const data = toSnakeCase(serializedData);
    this.props.update(data);
  };

  render() {
    return (
      <div className="py-4">
        <form
          name="create-repo"
          onSubmit={this.onSubmitHandler.bind(this)}
          ref={this.formRef}
        >
          {this.props.hint && <Hints type={this.props.hint} />}

          {this.props.title && (
            <p
              className="text-lg leading-6 font-medium
                  text-gray-900 dark:text-gray-100 py-4"
            >
              {this.props.title}
            </p>
          )}

          <div className="flex flex-wrap">
            {this.props.definitions().map((field, index) => {
              return (
                <div
                  key={`field-${field.name}-${index}`}
                  className={`${gridClasses(field)} py-2 pr-2`}
                >
                  <FieldRenderer
                    {...field}
                    namespace={'app'}
                    data={field}
                    props={this.props}
                    errors={this.props?.data?.errors || {}}
                  />
                </div>
              );
            })}
          </div>

          <div className="flex">
            <div className=" w-full sm:w-1/2">
              <Button variant="success" color="primary" size="md" type="submit">
                {I18n.t('common.save')}
              </Button>
            </div>
          </div>
        </form>
      </div>
    );
  }
}
