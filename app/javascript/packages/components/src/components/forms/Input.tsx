import React, { SyntheticEvent } from 'react';
import { connect } from 'react-redux';
import Select from 'react-select';
import Button from '../Button';
import { isArray } from 'lodash';
import DatePicker from 'react-datepicker';
import { ColorPicker } from './ColorPicker';
import 'react-datepicker/dist/react-datepicker.css';
import I18n from '../../../../../src/shared/FakeI18n';

function mapStateToProps(state) {
  const { theme } = state;
  return {
    theme,
  };
}

function borderColor(error) {
  if (error) {
    return 'red';
  }
  if (!error) {
    return 'gray';
  }
}

interface IWrapperComponentProps {
  className: string;
}
interface IWrapperComponent {
  label?: any;
  name?: any;
  type: any;
  value?: any;
  helperText?: any;
  defaultValue?: any;
  defaultChecked?: any;
  disabled?: any;
  required?: any;
  autoComplete?: 'current-password';
  checked?: boolean;
  handler?: any;
  error?: any;
  id?: any;
  theme?: any;
  props?: IWrapperComponentProps;
  data?: any;
  onChange?: (e: any) => void;
  options?: Array<any>;
  autoFocus?: boolean;
  placeholder?: string;
  accept?: string;
  labelMargin?: string;
  variant?: string;
  className?: string;
  hideImage?: boolean;
  style?: React.CSSProperties;
  onKeyDown?: (e: SyntheticEvent) => void;
  onKeyUp?: (e: SyntheticEvent) => void;
  dispatch?: any;
}

const WrappedComponent = React.forwardRef(function Input(
  {
    label,
    name,
    type,
    value,
    helperText,
    defaultValue,
    defaultChecked,
    disabled,
    handler,
    error,
    id,
    theme,
    dispatch,
    ...props
  }: IWrapperComponent,
  ref: React.ForwardedRef<any>
) {
  function inputAppearance(variant) {
    switch (variant) {
      case 'underline':
        return `border-dashed border-b-2 border-gray-400 
        w-full py-2 px-3 text-gray-700
        focus:outline-none focus:border-gray-600 dark:bg-black dark:text-white`;
      default:
        return `shadow appearance-none border border-${borderColor(
          error
        )}-300 rounded w-full py-2 px-3 text-gray-700 dark:bg-black dark:text-white
        leading-tight focus:outline-none focus:shadow-outline`;
    }
  }

  function handeRenderType() {
    switch (type) {
      case 'text':
      case 'string':
      case 'password':
      case 'number':
        return renderText();
      case 'textarea':
        return renderTextArea();
      case 'checkbox':
      case 'bool':
        return renderCheckbox();
      case 'select':
        return renderSelect();
      case 'radio':
        return renderRadioButton();
      case 'timezone':
        return renderTimezone();
      case 'upload':
        return renderUpload();
      case 'datetime':
        return renderDatetime();
      case 'color':
        return renderColor();
      default:
        return <p>nada {type}</p>;
    }
  }

  function themeForSelect() {
    if (theme === 'dark') {
      return {
        neutral0: 'black',
        neutral5: '#777',
        neutral10: '#777',
        neutral80: '#999',
        primary25: 'hotpink',
        primary: '#666',
      };
    }
    return {};
  }

  function renderText() {
    const { labelMargin, ...options } = props;
    const { className, ...inputOptions } = options;
    return (
      <FormField
        name={name}
        label={label}
        helperText={helperText}
        labelMargin={labelMargin}
      >
        <input
          className={`${inputAppearance(props.variant)}`}
          name={name}
          type={type}
          defaultValue={defaultValue}
          value={value}
          disabled={disabled}
          onChange={props.onChange}
          placeholder={props.placeholder}
          ref={ref}
          id={id}
          {...inputOptions}
        />
      </FormField>
    );
  }

  function renderSelect() {
    const isMulti = props.data && props.data.multiple;
    let initialValue = isMulti
      ? isArray(defaultValue)
        ? defaultValue.map((o) => ({ label: o, value: o }))
        : defaultValue
      : props.options.find(
          (o) => o.value == (defaultValue?.value || defaultValue)
        );

    return (
      <FormField name={name} label={label} helperText={helperText}>
        <Select
          isMulti={isMulti}
          options={props.options}
          name={`${name}${props.data && props.data.multiple ? '[]' : ''}`}
          value={value}
          defaultValue={initialValue}
          onChange={props.onChange}
          ref={ref}
          theme={(selectTheme) => ({
            ...selectTheme,
            borderRadius: 4,
            colors: {
              ...selectTheme.colors,
              ...themeForSelect(),
            },
          })}
        />
      </FormField>
    );
  }

  function renderCheckbox() {
    return (
      <div>
        <div className="flex items-center">
          <input
            id={name}
            name={name}
            type="checkbox"
            checked={value}
            value={value || true}
            disabled={disabled}
            onChange={props.onChange}
            defaultChecked={defaultValue}
            ref={ref}
            className="form-checkbox h-4 w-4 text-indigo-600 transition duration-150 ease-in-out"
          />
          <label
            htmlFor={name}
            className="ml-2 block font-bold text-sm leading-5 text-gray-900 dark:text-white"
          >
            {label}
          </label>
        </div>

        {helperText && (
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-100">
            {helperText}
          </div>
        )}
      </div>
    );
  }

  function renderUpload() {
    const ref = React.createRef<HTMLInputElement>();
    return (
      <FormField name={name} label={null} helperText={helperText}>
        <div className="flex flex-col items-center">
          {!props.hideImage && (
            <img className="pb-2" src={defaultValue} alt={label || name} />
          )}

          <input
            accept={props.accept || 'image/*'}
            style={{ display: 'none' }}
            name={name}
            ref={ref}
            onChange={(e) => handler(e.currentTarget.files[0])}
            // multiple
            type="file"
          />

          <label htmlFor={name}>
            <Button
              variant="contained"
              onClick={(e) => {
                e.preventDefault();
                ref.current && ref.current.click();
              }}
            >
              {I18n.t('common.upload_field', { field: label })}
            </Button>
          </label>
        </div>
      </FormField>
    );
  }

  function renderRadioButton() {
    return (
      <label className="inline-flex items-center">
        <input
          type="radio"
          className="form-radio h-4 w-4 text-indigo-600 transition duration-150 ease-in-out"
          id={id || name}
          name={name}
          value={value}
          disabled={disabled}
          defaultChecked={defaultChecked}
          onChange={props.onChange}
          ref={ref}
        />
        <div className="ml-2 block">
          <div className="text-sm font-bold leading-5 text-gray-900 dark:text-gray-100">
            {label}
          </div>

          {helperText && (
            <div className="mt-2 text-xs text-gray-500">{helperText}</div>
          )}
        </div>
      </label>
    );
  }

  function renderTextArea() {
    return (
      <div className="mt-6">
        {label && (
          <label
            htmlFor="about"
            className="block text-gray-700 dark:text-white text-sm font-bold mb-2"
          >
            {label}
          </label>
        )}
        <div className="">
          <textarea
            id="about"
            rows={3}
            name={name}
            className={`shadow appearance-none border border-${borderColor(
              error
            )}-300 rounded 
            w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-900 mb-3 leading-tight 
            focus:outline-none focus:shadow-outline`}
            defaultValue={defaultValue}
            value={value}
            disabled={disabled}
            onChange={props.onChange}
            placeholder={props.placeholder}
            ref={ref}
          />
        </div>
        {helperText && (
          <div className="mt-2 text-sm text-gray-500">{helperText}</div>
        )}
      </div>
    );
  }

  function renderTimezone() {
    const names = props.options.map((o) => ({ label: o, value: o }));
    const defaultTZ = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const defaultData = defaultValue || defaultTZ;
    return (
      <FormField name={name} label={label} helperText={helperText}>
        <Select
          options={names}
          label={label}
          defaultValue={{ label: defaultData, value: defaultData }}
          placeholder={'select timezone'}
          name={name}
          ref={ref}
          theme={(selectTheme) => ({
            ...selectTheme,
            borderRadius: 4,
            colors: {
              ...selectTheme.colors,
              ...themeForSelect(),
            },
          })}
        />
        {defaultTZ && (
          <div
            className="text-gray-500 text-xs"
            dangerouslySetInnerHTML={{
              __html: I18n.t('common.tz_hint', {
                timezone: defaultTZ,
              }),
            }}
          />
        )}
      </FormField>
    );
  }

  function renderColor() {
    return (
      <FormField
        name={name}
        label={label}
        error={error}
        helperText={helperText}
      >
        <ColorPicker
          color={value || defaultValue}
          name={name}
          label={label}
          variant={props.variant}
          placeholder={props.placeholder}
          colorHandler={props.onChange}
          // label={'Primary color'}
          error={error}
        />
      </FormField>
    );
  }

  function renderDatetime() {
    const val = value || defaultValue;

    return (
      <FormField
        name={name}
        label={label}
        error={error}
        helperText={helperText}
      >
        <DatePickerWrapper
          name={name}
          val={val}
          // error={error}
          onChange={props.onChange}
        />
      </FormField>
    );
  }

  return (
    <div className={`mb-4 ${props.className ? props.className : ''}`}>
      {handeRenderType()}
    </div>
  );
});

export default connect(mapStateToProps, null, null, { forwardRef: true })(
  WrappedComponent
);

interface FormFieldProps {
  name: string;
  label?: string;
  helperText: string;
  children: React.ReactNode;
  labelMargin?: string;
  error?: any;
}
function FormField({
  name,
  label,
  helperText,
  children,
  labelMargin,
}: FormFieldProps) {
  const margin = labelMargin ? labelMargin : 'mb-2';
  return (
    <React.Fragment>
      <label
        className={`block text-gray-700 dark:text-white text-sm font-bold ${margin}`}
        htmlFor={name}
      >
        {label}
      </label>
      {children}

      {helperText && (
        <div className="mt-2 text-xs text-gray-500 dark:text-gray-100">
          {helperText}
        </div>
      )}
    </React.Fragment>
  );
}

interface IDatePickerWrapper {
  name: string;
  val: string;
  onChange: (val: any) => void;
}

function DatePickerWrapper({ val, name, onChange }: IDatePickerWrapper) {
  const [value, setValue] = React.useState(val || new Date());

  function handleChange(val) {
    setValue(val);
    onChange && onChange(val);
  }

  return (
    <DatePicker
      name={name}
      selected={new Date(value)}
      // value={value || defaultValue}
      onChange={handleChange}
      showTimeSelect
      className={`shadow appearance-none border border-gray-300 rounded 
      w-full py-2 px-3 text-gray-700 dark:text-gray-200
      dark:bg-gray-700
      leading-tight focus:outline-none focus:shadow-outline`}
      // includeTimes={[
      //  setHours(setMinutes(new Date(), 0), 17),
      //  setHours(setMinutes(new Date(), 30), 18),
      //  setHours(setMinutes(new Date(), 30), 19),
      //  setHours(setMinutes(new Date(), 30), 17)
      // ]}
      dateFormat="MMMM d, yyyy h:mm aa"
    />
  );
}
