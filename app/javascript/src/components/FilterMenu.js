import React from 'react';
import Dropdown from './Dropdown'

const ITEM_HEIGHT = 48;

export default function LongMenu({
  filterHandler, 
  value,
  triggerButton,
  selectedOption,
  options
}) {
  const [anchorEl, setAnchorEl] = React.useState(null);
  //const [options, setOption] = React.useState(options);
  //const open = Boolean(anchorEl);

  function handleClick(event) {
    setAnchorEl(event.currentTarget);
  }

  function selectOption(option) {
    filterHandler(option, handleClose )
  }

  function handleClose() {
    setAnchorEl(null);
  }

  return (
    <React.Fragment>

      {/*triggerButton ? triggerButton(handleClick) : null*/}

      <Dropdown
        id="long-menu"
        labelButton={value}
        triggerButton={triggerButton}
      >
        {options.map(option => (

          <div className="py-1">
            <button 
              key={option.id} 
              selected={value === option.name} 
              onClick={()=> selectOption(option)}
              className="w-full group flex items-center 
              px-4 py-2 text-sm leading-5 text-gray-700 
              hover:bg-gray-100 hover:text-gray-900 
              focus:outline-none focus:bg-gray-100 
              focus:text-gray-900">
              
              {/*<svg className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500 group-focus:text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z"/>
                <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd"/>
                </svg>
              */}

              { option.icon &&
                <icon>
                  {option.icon}
                </icon>
              }

              <div className="flex flex-col justify-between ml-2">
                
                <span className="font-bold self-start">
                  {option.name || option.title}
                </span>
                
                {
                  option.description && 
                  <span className="text-xs">
                    {option.description}
                  </span>
                }
              </div>
              
            </button>
            
          </div>
        ))}
      </Dropdown>
    </React.Fragment>
  );
}