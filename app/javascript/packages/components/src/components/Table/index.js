import React from 'react'
import { isEmpty } from 'lodash'
import Dropdown from '../Dropdown'
import Button from '../Button'
import Tooltip from 'rc-tooltip'
import { MapIcon, ColumnsIcon, QueueIcon } from '../icons'

import {
  sortableContainer,
  sortableElement,
  sortableHandle,
} from 'react-sortable-hoc'

export default function Table({
  data,
  columns,
  search,
  meta,
  enableMapView,
  toggleMapView,
  sortable,
  onSort,
}) {
  const [tableColums, setTableColums] = React.useState(columns)

  const visibleColumns = () => tableColums.filter((o) => !o.hidden)

  const SortableContainer = sortableContainer(({ children }) => {
    return <tbody className="bg-white dark:bg-black">{children}</tbody>
  })

  const DragHandle = sortableHandle(() => (
    <td className="px-6 py-4 whitespace-nowrap border-b border-gray-200 dark:border-gray-900 hover:bg-gray-50 dark:hover:bg-gray-600 dark:text-gray-50">
      <QueueIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
    </td>
  ))

  const renderDefaultRow = (value) => {
    return (
      <td className="px-6 py-4 whitespace-nowrap border-b border-gray-200 dark:border-gray-900 hover:bg-gray-50 dark:hover:bg-gray-600 dark:text-gray-50">
        {value}
      </td>
    )
  }

  const SortableItem = sortableElement(({ item, sortable }) => (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-600">
      {sortable && <DragHandle></DragHandle>}

      {visibleColumns().map((object) => {
        return object.render
          ? object.render(item)
          : renderDefaultRow(item[object.field])
      })}
    </tr>
  ))

  const changeColumns = (columns) => {
    setTableColums(columns)
  }

  const onSortEnd = ({ oldIndex, newIndex }) => {
    onSort && onSort(oldIndex, newIndex)
  }

  return (
    <React.Fragment>
      <div className="flex justify-end">
        <SimpleMenu handleChange={changeColumns} options={tableColums} />

        {enableMapView && (
          <Tooltip placement="bottom" overlay={'View Map'}>
            <div className="relative inline-block text-left">
              <Button isLoading={false} variant="icon" onClick={toggleMapView}>
                <MapIcon />
              </Button>
            </div>
          </Tooltip>
        )}
      </div>

      <div className="align-middle min-w-full overflow-x-auto shadow overflow-hidden sm:rounded-lg">
        <table className="min-w-full">
          <thead>
            <tr className="border-b bg-gray-50 dark:bg-gray-900 dark:border-gray-600">
              {sortable && (
                <th
                  key={'visible-col-dragit'}
                  className="px-6 py-3
                    text-left text-xs leading-4
                    font-medium text-gray-500 uppercase tracking-wider"
                >
                  reorder
                </th>
              )}
              {visibleColumns().map((o) => (
                <th
                  key={`visible-col-${o.title}`}
                  className="px-6 py-3 text-left text-xs leading-4
                  font-medium text-gray-500 uppercase tracking-wider"
                >
                  {o.title}
                </th>
              ))}
            </tr>
          </thead>
          <SortableContainer onSortEnd={onSortEnd} useDragHandle>
            {data &&
              data.map((o, index) => (
                <SortableItem
                  sortable={sortable}
                  key={`item-${index}`}
                  index={index}
                  item={o}
                />
              ))}
          </SortableContainer>
        </table>
      </div>

      {meta && !isEmpty(meta) && <Pagination meta={meta} search={search} />}
    </React.Fragment>
  )
}

function Pagination({ meta, search }) {
  return (
    <div className="px-4 py-3 flex items-center justify-between sm:px-6--">
      <div className="flex-1 flex justify-between items-center">
        <Button
          onClick={() => search(meta.prev_page)}
          disabled={!meta.prev_page}
          variant="outlined"
        >
          {I18n.t('common.prev')}
        </Button>

        <p className="text-sm leading-5 text-gray-700 dark:text-gray-50">
          {I18n.t('common.showing')}
          <span className="font-medium ml-1 mr-1">{meta.current_page}</span>
          {I18n.t('common.to')}
          <span className="font-medium ml-1 mr-1">{meta.total_pages}</span>
          {I18n.t('common.of')}
          <span className="font-medium ml-1 mr-1">{meta.total_count}</span>
          {I18n.t('common.results')}
        </p>

        <Button
          disabled={!meta.next_page}
          onClick={() => search(meta.next_page)}
          variant="outlined"
        >
          {I18n.t('common.next')}
        </Button>
      </div>
    </div>
  )
}

function SimpleMenu(props) {
  function handleChange(o, e) {
    const checked = e.target.checked
    const item = Object.assign({}, o, { hidden: !checked })

    const columns = props.options.map((o) => {
      return o.title === item.title ? item : o
    })
    props.handleChange(columns)
  }
  return (
    <div>
      <Dropdown
        position={'right'}
        triggerButton={(cb) => (
          <Tooltip placement="bottom" overlay={'select columns'}>
            <Button isLoading={false} variant="icon" onClick={cb}>
              <ColumnsIcon />
            </Button>
          </Tooltip>
        )}
      >
        <div className="p-3 h-56 overflow-auto">
          {props.options.map((o) => (
            <div
              className="relative flex items-start p-1"
              key={`simple-menu-${o.title}`}
            >
              <div className="flex items-center h-5">
                <input
                  type="checkbox"
                  className="form-checkbox h-4 w-4 text-indigo-600 transition duration-150 ease-in-out"
                  defaultChecked={!o.hidden}
                  onChange={(e) => handleChange(o, e)}
                />
              </div>
              <div className="pl-7 text-sm leading-5">
                <label
                  htmlFor="comments"
                  className="ml-2 font-medium text-gray-700 dark:text-gray-200"
                >
                  {o.title}
                </label>
              </div>
            </div>
          ))}
        </div>
      </Dropdown>
    </div>
  )
}
