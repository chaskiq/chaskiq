import React from 'react';
import serialize from 'form-serialize';
import ErrorBoundary from '../ErrorBoundary';
import { ThemeProvider } from 'emotion-theming';
import { Loader } from './styled';

import { ImageRenderer } from './Image';
import { DataTableRenderer } from './DataTable';
import { ListRenderer } from './List';
import { SpacerRenderer } from './Spacer';
import { SingleSelectRenderer } from './SingleSelect';
import { TextInputRenderer } from './TextInput';
import { DropdownRenderer } from './DropDown';
import { CheckBoxesRenderer } from './CheckboxGroup';
import { ButtonWrapper, Button } from './Button';
import { TextRenderer } from './Text';
import { TextAreaRenderer } from './TextArea';
import { Separator } from './Serapator';
import { Padder, RendererWrapper } from './shared';
//= === RENDERERS

function ContentRenderer({
  field,
  values,
  updatePackage,
  disabled,
  appPackage,
}) {
  React.useEffect(() => {
    updatePackage &&
      updatePackage(
        {
          values: values || (appPackage && appPackage.values),
          field: {
            action: field,
          },
          // location: 'content'
        },
        () => {}
      );
  }, []);

  return (
    <p>{disabled ? 'dynamic content will be rendered here' : <Loader />}</p>
  );
}

type DefinitionRendererType = {
  schema: any;
  values?: any;
  updatePackage?: any;
  disabled?: any;
  location?: any;
  size?: any;
  appPackage?: any;
};

export function DefinitionRenderer({
  schema,
  values,
  updatePackage,
  disabled,
  location,
  size,
  appPackage,
}: DefinitionRendererType) {
  const [loading, setLoading] = React.useState(false);

  const form = React.createRef<HTMLFormElement>();

  function handleAction(e, field) {
    e.preventDefault();

    if (field.action.type === 'link') {
      window.location = field.action.url;
      return;
    }

    const serializedData = serialize(form.current, {
      hash: true,
      empty: true,
    });

    updatePackage && setLoading(true);

    updatePackage &&
      updatePackage(
        {
          values: serializedData,
          field: field,
          location: location || 'home',
        },
        () => {
          setLoading(false);
        }
      );
  }

  function handleRender(field) {
    switch (field.type) {
      case 'content':
        return (
          <ContentRenderer
            field={field}
            values={values}
            disabled={disabled}
            appPackage={appPackage}
            updatePackage={updatePackage}
          />
        );
      case 'image':
        return (
          <Padder>
            <ImageRenderer field={field} />
          </Padder>
        );
      case 'spacer':
        return <SpacerRenderer field={field} />;
      case 'data-table':
        return (
          <Padder>
            <DataTableRenderer
              //loading={loading}
              field={field}
            />
          </Padder>
        );
      case 'single-select':
        return (
          <Padder>
            <SingleSelectRenderer
              field={field}
              //loading={loading}
              disabled={disabled}
              handleAction={handleAction}
            />
          </Padder>
        );
      case 'input':
        return (
          <Padder>
            <TextInputRenderer
              field={field}
              loading={loading}
              handleAction={handleAction}
              disabled={disabled}
            />
          </Padder>
        );
      case 'dropdown':
        return (
          <Padder>
            <DropdownRenderer
              field={field}
              //loading={loading}
              // handleAction={handleAction}
            />
          </Padder>
        );
      case 'separator':
        return <Separator />;
      case 'checkbox':
        return (
          <Padder>
            <CheckBoxesRenderer
              // loading={loading}
              field={field}
            />
          </Padder>
        );
      case 'button':
        return (
          <Padder>
            <ButtonWrapper align={field.align}>
              <Button
                size={size === 'sm' ? 'xs' : field.size}
                // loading={loading || undefined}
                disabled={disabled || loading}
                variant={field.variant}
                width={field.width}
                // size={field.size}
                id={field.id}
                onClick={(e) => handleAction(e, field)}
              >
                {field.label}
              </Button>
            </ButtonWrapper>
          </Padder>
        );
      case 'text':
        return (
          <Padder>
            <TextRenderer field={field} />
          </Padder>
        );
      case 'list':
        return <ListRenderer field={field} handleAction={handleAction} />;
      case 'textarea':
        return (
          <Padder>
            <TextAreaRenderer loading={loading} field={field} />
          </Padder>
        );
      default:
        return (
          <p>
            no type for {JSON.stringify(field)}
            {field.type}
          </p>
        );
      /* return <FieldRenderer
          type={field.type}
          namespace={'data'}
          data={field}
          props={{
            data: field.value || {}
          }}
          errors={field.errors || {} }
        /> */
    }
  }

  function getKey() {
    return appPackage?.name;
  }

  return (
    <div className="flex flex-col">
      <form ref={form} onSubmit={() => false}>
        <ThemeProvider theme={{ size: size }}>
          {schema.map((field, i) => {
            return (
              <ErrorBoundary
                key={`renderer-field-${getKey()}-${field.id}-${i}`}
              >
                <RendererWrapper>{handleRender(field)}</RendererWrapper>
              </ErrorBoundary>
            );
          })}
        </ThemeProvider>
      </form>
    </div>
  );
}
