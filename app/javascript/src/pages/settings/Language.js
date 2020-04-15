import React from 'react'
import langsOptions from '../../shared/langsOptions'
import serialize from 'form-serialize'

import Button from '../../components/Button'
import Input from '../../components/forms/Input'

import { toSnakeCase } from '../../shared/caseConverter'
import FormDialog from '../../components/FormDialog'
import DataTable from '../../components/Table'

export default function LanguageForm ({ settings, update, namespace, fields }) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [selectedLang, setSelectedLang] = React.useState(null)
  const formRef = React.createRef()

  function handleChange (value) {
    const serializedData = serialize(formRef.current, {
      hash: true,
      empty: true
    })
    const data = toSnakeCase(serializedData)

    const next = {}

    fields.map((field) => {
      if (field !== 'locale') {
        next[`${field}_${value}`] = ''
      }
    })

    // const newData = Object.assign({}, data.settings, next)
    const newData = Object.assign({}, { key: settings.key }, next)

    console.log(settings)
    console.log('UPDATEATE', newData)

    update({ app: newData })
    toggleDialog()
  }

  function close () {
    setIsOpen(false)
  }

  function renderLangDialog () {
    return (
      isOpen && (
        <FormDialog
          open={isOpen}
          handleClose={close}
          // contentText={"lipsum"}
          titleContent={'Add language'}
          formComponent={
            //! loading ?
            <form onSubmit={() => false}>
              <Input
                label="select lang"
                type={'select'}
                value={selectedLang}
                // defaultValue={{label: item.to, value: item.to}}
                name={'age'}
                data={{}}
                onChange={(e) => handleChange(e.value)}
                options={langsOptions}
              ></Input>
            </form>
            // : <CircularProgress/>
          }
          dialogButtons={
            <React.Fragment>
              <Button onClick={toggleDialog} color="secondary">
                Cancel
              </Button>

              <Button // onClick={this.submitAssignment }
                color="primary"
              >
                Update
              </Button>
            </React.Fragment>
          }
          // actions={actions}
          // onClose={this.close}
          // heading={this.props.title}
        ></FormDialog>
      )
    )
  }

  function toggleDialog () {
    setIsOpen(!isOpen)
  }

  function handleSubmit (e) {
    e.preventDefault()
    const serializedData = serialize(formRef.current, {
      hash: true,
      empty: true
    })
    const data = toSnakeCase(serializedData)
    update(data)
  }

  function columns () {
    const cols = fields.map((field) => ({
      field: field,
      title: field,
      render: (row) => {
        return (
          row && (
            <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
              <div
                // onClick={(e)=>(showUserDrawer && showUserDrawer(row))}
                className="flex items-center"
              >
                {field === 'locale' ? (
                  <p className="block text-gray-700 text-sm font-bold mb-2">
                    {row[field]}
                  </p>
                ) : (
                  <Input
                    type={'text'}
                    // id="standard-name"
                    label={field}
                    defaultValue={row[field]}
                    name={`${namespace}[${field}_${row.locale}]`}
                    margin="normal"
                  />
                )}
              </div>
            </td>
          )
        )
      }
    }))

    return cols
    // return [{field: 'lang', title: 'lang', value: field}].concat(cols)
  }

  return (
    <div className="py-4">
      <p
        className="text-lg leading-6 font-medium
        text-gray-900 pb-4"
      >
        Languages
      </p>

      <form ref={formRef} onSubmit={(e) => e.preventDefault()}>
        <Button onClick={toggleDialog} variant={'outlined'}>
          Add language
        </Button>

        <div>
          {
            <DataTable
              title={'laguages'}
              // meta={this.props.meta}
              data={settings.translations}
              // search={this.props.search}
              // loading={this.props.loading}
              columns={columns()}
              // defaultHiddenColumnNames={this.props.defaultHiddenColumnNames}
              // tableColumnExtensions={this.props.tableColumnExtensions}
              // leftColumns={this.props.leftColumns}
              // rightColumns={this.props.rightColumns}
              // toggleMapView={this.props.toggleMapView}
              // map_view={this.props.map_view}
              // enableMapView={this.props.enableMapView}
            />
          }

          {/* <Table>
            <TableHead>
              <TableRow>
                <TableCell>Locale</TableCell>

                {
                  fields.map((field)=>(
                    <TableCell align="left">{field}</TableCell>
                  ))
                }

              </TableRow>
            </TableHead>
            <TableBody>
              {settings.translations.map(row => (
                <TableRow key={row.locale}>
                  <TableCell component="th" scope="row">
                    {row.locale}
                  </TableCell>

                  {
                    fields.map((field)=>{
                      return <TableCell align="left">
                              <TextField
                                //id="standard-name"
                                label={field}
                                defaultValue={row[field]}
                                name={`${namespace}[${field}_${row.locale}]`}
                                margin="normal"
                              />
                            </TableCell>
                    })
                  }

                </TableRow>
              ))}
            </TableBody>
        </Table> */}
        </div>

        <div container alignContent={'flex-end'}>
          <Button
            onClick={handleSubmit}
            variant={'contained'}
            color={'primary'}
          >
            Submit
          </Button>
        </div>
      </form>

      {renderLangDialog()}
    </div>
  )
}
