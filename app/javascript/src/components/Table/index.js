import React from 'react'
import { isEmpty } from 'lodash'
import Dropdown from '../Dropdown'
import Button from "../Button";
import Tooltip from "rc-tooltip";
import {
  MapIcon,
  ColumnsIcon
} from '../icons'

export default function Table ({ 
  data, 
  columns, 
  format, 
  search, 
  meta,
  enableMapView,
  toggleMapView
}) {
  const visibleColumns = (columns) => columns.filter(
    (o) => !o.hidden
  )
  const [visibleCols, setVisibleCols] = React.useState(
    visibleColumns(columns)
  )
  const [open, setOpen] = React.useState(false)

  const renderDefaultRow = (value) => {
    return (
      <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
        {value}
      </td>
    )
  }

  const handleFormat = (item) => {
    return (
      <tr>
        {visibleCols.map((o) =>
          o.render ? o.render(item) : renderDefaultRow(item[o])
        )}
      </tr>
    )
  }

  const changeColumns = (columns) =>{
    setVisibleCols(visibleColumns(columns))
  }

  return (
    <React.Fragment>

      <div className="flex justify-end">
        <SimpleMenu 
          handleChange={changeColumns}
          options={
            columns
          }
        />

        {enableMapView && <Tooltip placement="bottom" 
          overlay={"View Map"}>
          <div className="relative inline-block text-left">
            <Button
              isLoading={false}
              variant="clean"
              onClick={toggleMapView}>
              <MapIcon/>
            </Button>
          </div>
        </Tooltip>
      }
      </div>

      <table className="min-w-full">
        <thead>
          <tr>
            {visibleCols.map((o) => (
              <th key={`visible-col-${o.title}`} 
                className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                {o.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white">
          {data && data.map((o) => handleFormat(o))}
        </tbody>
      </table>

      {meta && !isEmpty(meta) && <Pagination meta={meta} search={search} />}
    </React.Fragment>
  )
}

function Pagination ({ meta, search }) {
  return (
    <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
      <div className="flex-1 flex justify-between items-center">
        <button
          onClick={() => search(meta.prev_page)}
          disabled={!meta.prev_page}
          className=" inline-flex items-center px-4 py-2 border border-gray-300 text-sm leading-5 font-medium rounded-md text-gray-700 bg-white hover:text-gray-500 focus:outline-none focus:shadow-outline-blue focus:border-blue-300 active:bg-gray-100 active:text-gray-700 transition ease-in-out duration-150"
        >
          Previous
        </button>

        <p className="text-sm leading-5 text-gray-700">
          Showing
          <span className="font-medium ml-1 mr-1">{meta.current_page}</span>
          to
          <span className="font-medium ml-1 mr-1">{meta.total_pages}</span>
          of
          <span className="font-medium ml-1 mr-1">{meta.total_count}</span>
          results
        </p>

        <button
          disabled={!meta.next_page}
          onClick={() => search(meta.next_page)}
          className="ml-3  inline-flex items-center px-4 py-2 border border-gray-300 text-sm leading-5 font-medium rounded-md text-gray-700 bg-white hover:text-gray-500 focus:outline-none focus:shadow-outline-blue focus:border-blue-300 active:bg-gray-100 active:text-gray-700 transition ease-in-out duration-150"
        >
          Next
        </button>
      </div>
    </div>
  )
}

function SimpleMenu (props) {
  const [anchorEl, setAnchorEl] = React.useState(null);
  //const [options, setOptions] = React.useState(props.options);

  function handleChange (o, e) {
    const checked = e.target.checked
    const item = Object.assign({}, o, { hidden: !checked })

    const columns = props.options.map((o) => {
      return o.title === item.title ? item : o
    })
    console.log(item, columns)
    props.handleChange(columns)
  }
  return (
    <div>

      <Dropdown
        position={'right'}
        triggerButton={(cb) => (
          <Tooltip placement="bottom" 
            overlay={"select columns"}>
            <Button
              isLoading={false}
              variant="clean"
              onClick={cb}>
              <ColumnsIcon/>
            </Button>
          </Tooltip>
        )}>
        <div className="p-2 h-56 overflow-auto">
          {
            props.options.map((o)=> 
              <div class="relative flex items-start" 
                   key={`simple-menu-${o.title}`}>
                <div class="flex items-center h-5">
                  <input 
                  type="checkbox" 
                  class="form-checkbox h-4 w-4 text-indigo-600 transition duration-150 ease-in-out"
                  defaultChecked={!o.hidden}
                  onChange={(e)=> handleChange(o, e) }
                  />
                </div>
                <div class="pl-7 text-sm leading-5">
                  <label for="comments" class="font-medium text-gray-700">
                  {o.title}
                  </label>
                </div>
              </div>
            )
          }
        </div>
      </Dropdown>
    </div>
  );
}