import React from 'react'
import BaseButton from '../Button'
import serialize from 'form-serialize'
import tw from 'twin.macro'
import styled from '@emotion/styled'
import ReactMarkdown from 'react-markdown'
import { darken, lighten, readableColor } from 'polished'
import { keyframes } from '@emotion/core'
import List, {
  ListItem,
  ListItemText,
  ItemListPrimaryContent,
  ItemListSecondaryContent
} from './List'
import ErrorBoundary from '../ErrorBoundary'

import { ThemeProvider } from 'emotion-theming'

const spin = keyframes`
  100% { 
    transform: rotate(360deg); 
  } 
`

const LoaderWrapper = styled.div`
  ${() => tw`flex justify-center items-center`}
`

const Loader = styled.div`
  animation: ${spin} 0.5s infinite linear;
  border-top-color: white !important;
  
  ${() => tw`
    ease-linear rounded-full border-2 
    border-t-2 border-gray-900 h-4 w-4
    mx-auto
    my-2
  `}
  
`

export default function Progress ({ size }) {
  return (
    <LoaderWrapper>
      <Loader/>
    </LoaderWrapper>
  )
}

//= === RENDERERS

function textColor (color) {
  const lightReturnColor = '#000'
  const darkReturnColor = '#fff'
  return readableColor(color, lightReturnColor, darkReturnColor, true)
}

const SingleSelect = styled.div`
  ${() => tw`flex flex-col`}
  .label {
    ${() => tw`py-2`}
  }

  .content {
    ${() => tw`inline-flex`}
  }
`

const SingleSelectButton = styled.button`
  ${() => tw`outline-none border font-light py-2 px-4`}
  ${(props) => props.i === 0 ? tw`rounded-l` : props.i === props.field.options.length - 1 ? tw`rounded-r` : ''}
  ${(props) => props.i !== 0 ? tw`border-l-0` : ''}
  ${(props) => props.isDisabled || props.isSaved ? tw`bg-white pointer-events-none` : ''}
  ${(props) => !props.isSaved && !props.isSelected && !props.isDisabled && !props.isSaved ? tw`text-indigo-400 hover:text-gray-600 bg-white hover:bg-gray-100 border-indigo-400` : ''}
  ${(props) => props.isFailed ? tw`bg-white hover:bg-gray-100 border-red-400` : ''}
  ${(props) => props.isSelected ? tw`bg-indigo-600 text-gray-100 border-indigo-600 pointer-events-none` : ''}
`

const Button = styled(BaseButton)`
  ${(props) => props.theme && props.theme.palette && !props.disabled
    ? `
    background-color: ${props.theme.palette.primary} !important;
    color: ${textColor(props.theme.palette.primary)} !important;
    border-color: ${props.theme.palette.primary} !important;
    ` : 'bg-gray-600 text-gray-100'
  }

  display: block;

  ${(props) => props.disabled
    ? tw`bg-gray-200 text-gray-300 hover:bg-gray-200 hover:text-gray-300 cursor-auto` : ''
  }

  ${(props) => {
    switch (props.align) {
      case 'left':
        return tw`self-start`
      case 'center':
        return tw`self-center text-center`
      case 'right':
        return tw`self-end`
      default:
        return ''
    }
  }};

  ${(props) => {
    switch (props.width) {
      case 'full':
        return tw`w-full text-center`
      default:
        return ''
    }
  }}

  ${(props) => {
    switch (props.variant) {
      case 'success':
        return ''
      case 'main':
        return ''
      case 'clean':
        return ''
      case 'outlined':
        return `
          ${(props) => props.theme.palette ? `
            border-color: ${props.theme.palette.primary} !important;
          ` : `
            border-color: "#ccc" !important;
          `}
        `
      case 'danger':
        return ''
      case 'link':
        return `
        ${(props) => tw`text-sm leading-5 font-bold text-gray-900 hover:text-indigo-500`}
        ${(props) => props.theme.palette ? '' : ''}
      `

      default:
        return `
          ${(props) => props.theme.palette ? `
            background-color: ${props.theme.palette.primary} !important;
            color: ${textColor(props.theme.palette.primary)} !important;
            border: none !important;
            &:hover{
              background-color: ${darken(0.1, props.theme.palette.primary)} !important;
              color: ${textColor(props.theme.palette.primary)} !important;
              border: none !important;
            }`
          : ''}
        `
    }
  }};
`

export function SingleSelectRenderer ({ field, handleAction }) {
  function handleClick (e, o) {
    if (!o.action) {
      e.preventDefault()
      return
    }
    handleAction(e, o)
  }

  return (
    <SingleSelect>
      <p className="label">{field.label}</p>
      <div className="content">
        {
          field.options.map((o, i) => {
            const isSelected = field.value === o.id
            const isFailed = field.save_state === 'failed'
            const isDisabled = field.disabled || o.disabled
            const isSaved = field.save_state === 'saved'
            return <SingleSelectButton
              onClick={(e) => handleClick(e, o)}
              key={`single-select-${field.id}-${o.id}`}
              isSelected={isSelected}
              isFailed={isFailed}
              isDisabled={isDisabled}
              isSaved={isSaved}
              i={i}
              field={field}
              className={'outline-none border'}>
              {o.text}
            </SingleSelectButton>
          })
        }
      </div>
    </SingleSelect>
  )
}

const TextInput = styled.input`
  ${() => tw`p-3 m-0 border relative shadow-sm block w-full 
  pr-10 focus:shadow-outline sm:text-sm sm:leading-5 
  `}

  ${() => tw`block w-full transition ease-in-out duration-150 sm:text-sm sm:leading-5`}

  ${(props) => props.field.save_state === 'failed' ? tw`border-red-300 text-red-500 placeholder-red-300 bg-red-100 focus:border-red-300` : ''}

  ${(props) => props.disabled && props.field.save_state === 'failed' ? tw`border-red-300 text-red-200 placeholder-red-300 bg-red-100 focus:border-red-300` : ''}

  ${(props) => props.disabled && !props.field.save_state ? tw`border-gray-300 text-gray-200 placeholder-gray-300 bg-gray-100 border-r-0 focus:border-gray-300` : ''}

  ${(props) => !props.field.save_state && !props.error ? tw`border-gray-300 text-gray-900 placeholder-gray-300 focus:border-gray-300` : ''}

  ${(props) => !props.field.save_state && props.error ? tw`border-red-300 text-red-900 placeholder-red-300 focus:border-red-300` : ''}

  margin:0px !important;

  ${(props) => props.field.action
    ? `border-top-right-radius: 0rem !important;
    border-bottom-right-radius: 0rem !important;` : ''
  }

  ${(props) => props.disabled
    ? `background: #f6f4f4 !important;
    color: #ddd !important;` : ''
  }
`

const ErrorMessage = styled.span`
  ${() => tw`text-red-500 mb-2 text-sm`}
`

const TextInputWrapper = styled.div`
  ${(props) => props.shadow ? tw`shadow-sm` : ''}

  ${(props) => props.field.action
    ? tw`rounded-none rounded-l-md`
    : tw`rounded-none`
  }

  ${() => tw`flex relative`}
`

const TextInputButton = styled.div`

  ${(props) => props.theme.size === 'sm'
    ? tw`px-1 py-1`
    : tw`px-5 py-3`
  };

  ${() => tw`-ml-px relative inline-flex items-center
   text-sm leading-5 font-medium 
  rounded-r-md text-gray-700 bg-gray-100 hover:text-gray-500 
  transition ease-in-out duration-150`}

  ${(props) => !props.disabled
    ? tw`hover:bg-white focus:outline-none focus:shadow-outline`
    : ''
  }


  ${(props) =>
    props.disabled ? `
      border: 1px solid #ccc;
      ${() => tw`border border-gray-300 text-gray-200 bg-gray-100 hover:text-gray-200 hover:bg-gray-100`}
      ${() => tw`cursor-pointer`}

    `
     : props.theme && props.theme.palette
      ? `
      background-color: ${props.theme.palette.primary};
      color: ${textColor(props.theme.palette.primary)};
  
      &:focus {
        background-color: ${props.theme.palette.primary};
        color: ${textColor(props.theme.palette.primary)};
      }
      &:active {
        background-color: ${props.theme.palette.primary};
        color: ${textColor(props.theme.palette.primary)};
      }
  
      &:hover {
        background-color: ${lighten(0.1, props.theme.palette.primary)};
        color: ${textColor(props.theme.palette.primary)};
      }
      `
      : tw`bg-blue-700 
      hover:bg-blue-600 
      active:bg-gray-100 
      active:text-gray-700
      `
  }

  ${(props) => !props.disabled ? tw`
  cursor-pointer
  focus:outline-none 
  focus:shadow-outline`
  : ''}

  svg {
    position: absolute;
    left: 4px;
    ${(props) => props.saved ? tw`text-green-400` : tw`text-white`}
  }

  ${(props) => props.saved ? `
    position: absolute;
    right: 3px;
    top: -3px;
    display: block;
    border: 1px solid transparent;
    background: transparent;` : ''
  }
`

const ArrowRight = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
  </svg>
)

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
  </svg>
)

export function TextInputRenderer ({ field, handleAction, loading, disabled }) {
  function isDisabled () {
    return disabled || loading || field.disabled || field.save_state === 'saved'
  }

  function isSaved () {
    return field.save_state === 'saved'
  }

  return <FormField
    name={field.name || field.id}
    label={field.label}
    helperText={field.hint}
    error={field.errors}>
    <TextInputWrapper field={field}>
      <TextInput
        field={field}
        error={field.errors}
        type="text"
        id={field.id}
        name={field.name || field.id}
        autoComplete="off"
        onKeyDown={ (e) => {
          if (e.keyCode === 13) {
            e.preventDefault()
            handleAction(e, field)
          }
        }}
        disabled={isDisabled()}
        defaultValue={field.value || ''}
        placeholder={field.placeholder}
      />

      { !field.action && field.save_state === 'saved' &&
                <TextInputButton
                  disabled={true}
                  saved={true}>
                  <CheckIcon/>
                </TextInputButton>
      }

      {
        field.action &&
          <TextInputButton
            onClick={(e) => {
              if (!isDisabled() && !isSaved()) handleAction(e, field)
            }}
            saved={field.save_state === 'saved'}
            disabled={isDisabled()}>
            {
              field.save_state === 'saved'
                ? <CheckIcon/>
                : loading ? <Progress/> : <ArrowRight/>
            }
          </TextInputButton>
      }
    </TextInputWrapper>
    {
      field.errors &&
        <ErrorMessage
          key={`error-for-${field.name}`}
          className="error">
          {field.errors}
        </ErrorMessage>
    }
  </FormField>
}

const Paragraph = styled.div`

  p {
    font-size: inherit;
    font-weight: inherit;
    color: inherit;
    line-height: inherit;
  }

  ${(props) => {
    switch (props.styl) {
      case 'header':
        return tw`text-lg leading-8 font-bold text-gray-800`
      case 'muted':
        return tw`text-sm leading-5 text-gray-500`
      case 'error':
        return tw`text-sm leading-5 text-red-500`
      default:
        return tw`text-sm`
    }
  }};

  ${(props) => {
    switch (props.align) {
      case 'left':
        return tw`text-left`
      case 'center':
        return tw`text-center`
      case 'right':
        return tw`text-right`
      case 'justify':
        return tw`text-justify`
      default:
        return ''
    }
  }};
`

const Padder = styled.div`
  ${(props) => props.theme.size === 'sm'
    ? tw`mx-2 my-2`
    : tw`mx-4 my-2`
  };

  ${(props) => {
    switch (props.align) {
      case 'left':
        return tw`text-left`
      case 'center':
        return tw`text-center`
      case 'right':
        return tw`text-right`
      case 'justify':
        return tw`text-justify`
      default:
        return ''
    }
  }};
`

export function TextRenderer ({ field }) {
  return <Paragraph
    align={field.align}
    styl={field.style}>
    {
      field.style === 'header' && <h3>{field.text}</h3>
    }

    {
      field.style !== 'header' && <ReactMarkdown source={field.text}/>
    }
  </Paragraph>
}

const Spacer = styled.div`
  ${(props) => {
    switch (props.size) {
      case 'xs':
        return tw`h-1`
      case 's':
        return tw`h-2`
      case 'm':
        return tw`h-4`
      case 'l':
        return tw`h-6`
      case 'xl':
        return tw`h-8`
      default:
        return 'h-1'
    }
  }};
`
export function SpacerRenderer ({ field }) {
  return <Spacer size={field.size}/>
}

const DataTable = styled.dl`
${(props) => props.theme.size === 'sm'
    ? tw`px-1 py-1 grid sm:grid-cols-3 sm:gap-4 sm:px-1`
    : tw`px-4 py-5 grid sm:grid-cols-3 sm:gap-4 sm:px-6`
  };
`

const Dt = styled.dt`
${() => tw`text-sm leading-5 font-medium text-gray-500`};
`

const Dd = styled.dd`
${() => tw`mt-1 text-sm leading-5 text-gray-900 sm:mt-0 sm:col-span-2`};
`

export function DataTableRenderer ({ field }) {
  return (
    <DataTable>
      {field.items && field.items.map((o, i) => (
        <React.Fragment key={`dl-${o.field}-${i}`}>
          <Dt>
            {o.field}
          </Dt>
          <Dd>
            {o.value}
          </Dd>
        </React.Fragment>
      ))}
    </DataTable>
  )
}

// image support
export function ListRenderer ({ field, handleAction }) {
  return <List>
    {
      field.items.map((o) => (
        <ListItem
          key={o.id}
          avatar={
            o.image && <img width={55} src={o.image}/>
          }
          onClick={(e) => {
            o.action && handleAction(e, o)
          }
          }>

          <ListItemText
            primary={
              <ItemListPrimaryContent variant="h5">
                {o.title}
              </ItemListPrimaryContent>
            }
            secondary={
              <ItemListSecondaryContent>
                {o.subtitle}
              </ItemListSecondaryContent>
            }
            terciary={
              <React.Fragment>
                <div
                  className="mt-2 flex items-center
                        text-sm leading-5 text-gray-500 justify-end"
                >
                  {o.tertiary_text}
                </div>
              </React.Fragment>
            }
          />
        </ListItem>
      ))
    }
  </List>
}

const ImageContainer = styled.div`
  ${(props) => tw`flex`}
  ${(props) => {
    switch (props.align) {
      case 'left':
        return tw`justify-start`
      case 'center':
        return tw`justify-center`
      case 'right':
        return tw`justify-end`
      default:
        return tw`justify-start`
    }
  }};
`
const Image = styled.img`
  ${(props) => props.rounded ? tw`rounded-full` : ''}
`

export function ImageRenderer ({ field }) {
  return <ImageContainer align={field.align}>
    <Image src={field.url}
      // className={`${s} ${a} ${r}`}
      rounded={field.rounded}
      styl={field.style}
      width={field.width}
      height={field.height}>
      {field.text}
    </Image>
  </ImageContainer>
}

const TextArea = styled.div`
  ${() => tw`flex flex-col`}

  label {
    ${(props) => props.error ? tw`text-red-500` : ''}
  }

  textarea {
    ${(props) => props.error ? tw`border-red-500 text-red-500 bg-red-100` : 'text-gray-700'}

    ${() => tw`shadow appearance-none border 
      rounded w-full py-2 px-3
      leading-tight focus:outline-none focus:shadow-outline`
    }
  }
`

export function TextAreaRenderer ({ field, loading }) {
  return (
    <FormField name={field.name}
      label={field.label}
      helperText={field.hint}
      error={field.errors}>
      <TextArea error={field.errors}>
        <textarea
          id={field.id}
          name={field.name || field.id}
          disabled={field.disabled || loading }
          placeholder={field.placeholder}>
          {field.value}
        </textarea>
      </TextArea>
    </FormField>
  )
}

const DropDown = styled.div`
  ${(props) => tw`relative inline-block text-left w-full`}
  .content{
    ${() => tw`z-50 w-full origin-top-right absolute right-0 mt-2 rounded-md shadow-lg`}
  }

  .content-wrap {
    ${() => tw`rounded-md bg-white shadow-xs`}
    height: 130px;
    overflow: auto;
  }
  .py-1{
    ${() => tw`py-1`}
  }
`

const ItemButton = styled.button`
  ${() => tw`w-full text-left block px-4 py-2 text-sm leading-5
    text-gray-700 hover:bg-gray-100 hover:text-gray-900
    focus:outline-none focus:bg-gray-100
    focus:text-gray-900`
  }

  ${(props) => props.selected ? tw`bg-gray-100` : ''}
`

const SelectButton = styled.button`
  ${() => tw`inline-flex justify-between w-full rounded-md
  border border-gray-300 px-4 py-2 bg-white text-sm
  leading-5 font-medium text-gray-700 hover:text-gray-500
  focus:outline-none focus:border-blue-300 focus:shadow-outline
  active:bg-gray-100 active:text-gray-800 transition ease-in-out duration-150`
  }

  svg{
    ${() => tw`-mr-1 ml-2 h-5 w-5`}
  }
`

// TODO: disabled state / error state / saved state
export function DropdownRenderer ({ field, handleAction }) {
  const [open, setOpen] = React.useState(false)

  const defaultValue = field.value && field.options.find(
    (o) => o.id === field.value
  )

  const [selected, setSelected] = React.useState(defaultValue)

  React.useEffect(() => {
    if (selected) setOpen(false)
  }, [selected])

  console.log(selected)

  return (

    <DropDown>
      <div>
        {field.label && <p>{field.label}</p>}
        <span className="rounded-md shadow-sm">
          <SelectButton
            onClick={() => setOpen(!open) }
            type="button"
            id="options-menu"
            aria-haspopup="true"
            aria-expanded="true">
            { selected ? selected.text : 'Choose one...' }
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </SelectButton>

          { selected &&
            <input
              type="hidden"
              value={selected.id || ''}
              name={field.id || field.name}
            />
          }

        </span>
      </div>

      {
        open &&
        <div className="content">
          <div className="content-wrap">
            <div className="py-1"
              role="menu"
              aria-orientation="vertical"
              aria-labelledby="options-menu">
              {
                field.options && field.options.map(
                  (o) => (
                    <div key={`${field.id}-${o.id}`}>
                      <ItemButton
                        onClick={() => setSelected(o) }
                        key={`field-${field.id}-${o.id}`}
                        type="button"
                        selected={ selected && selected.id === o.name}
                        role="menuitem">
                        {o.text}
                      </ItemButton>
                    </div>
                  )
                )}
            </div>
          </div>
        </div>
      }
    </DropDown>
  )
}

const CheckboxGroup = styled.div`
  ${() => tw`block`}

  .label{
    ${() => tw`text-gray-700`}
  }

  .wrapper {
    ${() => tw`mt-2`}
    label{
      ${() => tw`inline-flex items-center`}
      input {
        ${() => tw`text-indigo-600`}
      }
    }
    .pad {
      ${() => tw`ml-2`}
    }
  }
`

// TODO: error state
export function CheckBoxesRenderer ({ field }) {
  return (
    <CheckboxGroup>
      <span className="label">
        {field.label}
      </span>
      <div className="wrapper">
        {
          field.options && field.options.map((o) => (
            <div key={`field-${field.id}-${o.id}`}>
              <label>
                <input
                  name={o.name}
                  disabled={field.disabled || o.disabled || field.save_state === 'saved'}
                  type="checkbox"
                  defaultChecked={field.value && field.value.includes(o.id)}
                />
                <span className="pad">{o.text}</span>
              </label>
            </div>
          ))
        }
      </div>
    </CheckboxGroup>
  )
}

const Separator = styled.div`
  ${() => tw`my-2 border-gray-200`}
  border-bottom-width: 1px;
`

const ButtonWrapper = styled.div`
  ${(props) => {
    switch (props.align) {
      case 'left':
        return tw`flex justify-start`
      case 'center':
        return tw`flex justify-center`
      case 'right':
        return tw`flex justify-end`
      default:
        return ''
    }
  }};
`

function ContentRenderer ({ field, updatePackage, disabled, appPackage }) {
  React.useEffect(() => {
    updatePackage && updatePackage({
      values: appPackage && appPackage.values,
      field: {
        action: field
      }
      // location: 'content'
    }, () => {
    })
  }, [])

  return <p>{ disabled
    ? 'dynamic content will be rendered here'
    : <Loader/>
  }</p>
}

export function DefinitionRenderer ({
  schema,
  updatePackage,
  getPackage,
  disabled,
  location,
  size,
  appPackage
}) {
  const [loading, setLoading] = React.useState(false)

  const form = React.createRef()

  function handleAction (e, field) {
    e.preventDefault()

    if (field.action.type === 'link') {
      window.location = field.action.url
      return
    }

    const serializedData = serialize(form.current, {
      hash: true,
      empty: true
    })

    updatePackage && setLoading(true)

    updatePackage && updatePackage({
      values: serializedData,
      field: field,
      location: location || 'home'
    }, () => {
      setLoading(false)
    })
  }

  function handleRender (field) {
    switch (field.type) {
      case 'content':
        return <ContentRenderer
          field={field}
          disabled={disabled}
          appPackage={appPackage}
          updatePackage={updatePackage}
        />
      case 'image':
        return <Padder>
          <ImageRenderer
            field={field}
          />
        </Padder>
      case 'spacer':
        return <SpacerRenderer field={field}/>
      case 'data-table':
        return <Padder>
          <DataTableRenderer
            loading={loading}
            field={field}
          />
        </Padder>
      case 'single-select':
        return <Padder>
          <SingleSelectRenderer
            field={field}
            loading={loading}
            handleAction={handleAction}
          />
        </Padder>
      case 'input':
        return <Padder>
          <TextInputRenderer
            field={field}
            loading={loading}
            handleAction={handleAction}
            disabled={disabled}
          />
        </Padder>
      case 'dropdown':
        return <Padder>
          <DropdownRenderer
            field={field}
            loading={loading}
            handleAction={handleAction}
          />
        </Padder>
      case 'separator':
        return <Separator/>
      case 'checkbox':
        return <Padder>
          <CheckBoxesRenderer
            loading={loading}
            field={field}
          />
        </Padder>
      case 'button':
        return <Padder>
          <ButtonWrapper
            align={field.align}>
            <Button
              size={size === 'sm' ? 'xs' : field.size }
              loading={loading || undefined }
              disabled={disabled || loading}
              variant={field.variant}
              width={field.width}
              // size={field.size}
              id={field.id}
              onClick={(e) => handleAction(e, field) }>
              {field.label}
            </Button>
          </ButtonWrapper>
        </Padder>
      case 'text':
        return <Padder>
          <TextRenderer
            loading={loading}
            field={field}
          />
        </Padder>
      case 'list':
        return <ListRenderer
          field={field}
          loading={loading}
          handleAction={handleAction}
        />
      case 'textarea':
        return <Padder>
          <TextAreaRenderer
            loading={loading}
            field={field}
          />
        </Padder>
      default:
        return <p>no type for {JSON.stringify(field)}{field.type}</p>
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

  return <div className="flex flex-col">
    <form ref={form} onSubmit={ () => false }>
      <ThemeProvider theme={{ size: size }}>
        {schema.map((field, i) => {
          return (
            <ErrorBoundary key={`renderer-field-${i}`}>
              <RendererWrapper>
                {handleRender(field)}
              </RendererWrapper>
            </ErrorBoundary>
          )
        })}
      </ThemeProvider>
    </form>
  </div>
}

const RendererWrapper = styled.div`
  ${tw`w-full`}
`

const Label = styled.label`
  ${() => tw`block text-gray-700 text-sm font-bold mb-2`}
`

const HelperText = styled.div`
  ${() => tw`mt-2 text-xs text-gray-500`}
`

function FormField ({ name, label, helperText, children, error }) {
  return (
    <React.Fragment>
      <Label
        htmlFor={name}
      >
        {label}
      </Label>

      {children}

      {helperText && (
        <HelperText>
          {helperText}
        </HelperText>
      )}
    </React.Fragment>
  )
}

export function BaseInserter ({
  onItemSelect,
  pkg,
  app,
  onInitialize,
  getPackage
}) {
  const [p, setPackage] = React.useState(null)

  const params = {
    appKey: app.key,
    id: pkg.name + '',
    hooKind: 'configure',
    ctx: {}
  }

  React.useEffect(() => {
    if (p && (p.kind === 'initialize')) {
      onInitialize({
        hooKind: p.kind,
        definitions: p.definitions,
        values: p.values,
        wait_for_input: p.wait_for_input,
        id: pkg.id,
        name: pkg.name
      })
    }
  }, [p])

  React.useEffect(() => getPackage(params, (data) => {
    setPackage(data.app.appPackage.callHook)
  }), [])

  function updatePackage (formData, cb) {
    const newParams = { ...params, ctx: formData }
    getPackage(newParams, (data) => {
      setPackage(data.app.appPackage.callHook)
      cb && cb()
    })
  }

  return (
    <div>
      {
        !p && <Progress/>
      }
      {p && <DefinitionRenderer
        schema={p.definitions}
        getPackage={getPackage}
        appPackage={p}
        updatePackage={updatePackage}
      />}
    </div>
  )
}
