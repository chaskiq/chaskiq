import React from 'react';
import { Link } from 'react-router-dom';
import Tooltip from 'rc-tooltip';
import LayoutDefinitions from './layoutDefinitions';
import FilterMenu from '@chaskiq/components/src/components/FilterMenu';
import UserMenu from './user_menu';
import gridIcon from '../images/grid-icon.png';

export function InnerMenu({ current_section, categories }) {
  const layout = LayoutDefinitions();
  return categories
    .filter((o) => o.id === current_section)
    .map(({ id, label, children }) => {
      //  expanded={expanded === id}
      return (
        <div
          key={`sidebar-section-${id}`}
          className="h-0-- flex-1 flex flex-col pt-5 pb-4 overflow-y-auto"
        >
          {layout.mainSidebar.displaySectionTitle && (
            <div
              className="flex items-center flex-shrink-0 px-4
              text-lg leading-6 font-bold text-gray-900 dark:text-gray-100"
            >
              <h3 className="font-bold w-full">{label}</h3>
            </div>
          )}
          <nav className="mt-5 flex-1 px-4 space-y-2">
            {children
              .filter((o) => !o.hidden)
              .filter((o) => o.allowed)
              .map(
                ({
                  id: childId,
                  label,
                  icon,
                  active,
                  url,
                  _onClick,
                  render,
                  allowed,
                }) =>
                  !render ? (
                    <Link
                      key={`sidebar-section-child-${id}-${childId}`}
                      to={url}
                      aria-label={label}
                      disabled={!allowed}
                      className={`
                      ${active ? layout.mainSidebar.buttons.activeClass : ''} 
                      ${!allowed ? 'bg-gray-100 dark:bg-gray-100' : ''} 
                      ${layout.mainSidebar.buttons.defaultClass}`}
                    >
                      <div className="text-lg mr-3 h-6 w-6 transition ease-in-out duration-150">
                        {icon}
                      </div>
                      {label || childId}
                    </Link>
                  ) : (
                    render()
                  )
              )}
          </nav>
        </div>
      );
    });
}

export function MainMenu({
  current_section,
  categories,
  app,
  itemClass,
  selectedClass,
  displayLabel,
  displayTooltip,
}) {
  const c = categories || LayoutDefinitions().categories(app);

  function itemClassName(o) {
    if (current_section == o.id)
      return selectedClass || itemClass || defaultClass();
    return itemClass || defaultClass();
  }

  function defaultClass() {
    return `text-gray-700 dark:text-white
    rounded-md flex 
    justify-center 
    cursor-pointer bg-gray-50 dark:bg-black
    hover:bg-gray-100 dark:hover:bg-gray-800 
    h-10 w-full 
    items-center 
    text-2xl font-semibold 
    my-5 overflow-hidden`;
  }

  function renderMenuItem(o) {
    return (
      <Link to={`${o.url}`} aria-label={o.label} className={itemClassName(o)}>
        <div className="flex items-center space-x-2">
          <span>{o.icon}</span>
          {displayLabel && <span>{o.label}</span>}
        </div>
      </Link>
    );
  }

  return c
    .filter((o) => o.allowed)
    .map((o) => {
      if (!displayTooltip) return renderMenuItem(o);

      if (displayTooltip)
        return (
          <Tooltip
            key={`sidebar-categories-${o.id}`}
            placement="right"
            overlay={o.label}
          >
            {renderMenuItem(o)}
          </Tooltip>
        );
    });
}

export function MainMenuHorizontal({
  current_section,
  current_user,
  app,
  displayLabel,
}) {
  const layout = LayoutDefinitions();

  return (
    <div className="secondary-50 newBlue-300 fixed w-full top-0 z-10 bg-gradient-to-r from-gradientHero via-gradientHero-100 to-gradientHero-200">
      <div className="mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <span className="flex space-x-8 items-center">
            <div className="relative z-50 cursor-pointer">
              <FilterMenu
                options={layout.horizontalMenu.optionsForFilter}
                value={null}
                panelClass={
                  'absolute left-0 grid grid-rows-3 grid-flow-col gap-4 p-2 min-w-max mt-2 origin-top-right bg-white dark:bg-darkColor-900 rounded-md shadow-lg'
                }
                filterHandler={(e) => console.log(e)}
                triggerButton={(handler) => (
                  <button
                    className="flex items-center justify-center outline outline-0"
                    id="headlessui-menu-button-2"
                    onClick={handler}
                    type="button"
                    aria-haspopup="true"
                    aria-expanded="false"
                  >
                    <span className="outline-0 flex items-center justify-center space-x-2 text-white select-none">
                      <img
                        alt="menu"
                        src={gridIcon}
                        className="w-5 h-5 outline-0"
                      />
                    </span>
                  </button>
                )}
                position={'left'}
              />
            </div>

            {layout.horizontalMenu.menuLeft.map((o) => (
              <Link
                to={o.href}
                key={o.key}
                className="flex space-x-3 items-center cursor-pointer"
              >
                <img className="block w-24" src={o.icon} alt={o.title} />
              </Link>
            ))}
          </span>

          <span className="flex items-center space-x-4">
            <div className="relative z-50 cursor-pointer">
              <UserMenu
                triggerButton={(handler) => (
                  <button
                    onClick={handler}
                    id="user_menu"
                    className="text-xs leading-4 font-medium text-gray-500 group-hover:text-gray-700 group-focus:underline transition ease-in-out duration-150"
                  >
                    <div className="flex items-center">
                      <span className="flex items-center space-x-2 text-white">
                        <span className="flex flex-grow min-w-8 w-8 h-8 items-center justify-center uppercase bg-link text-white rounded-full text-xs shadow-lg">
                          <img
                            className="w-max h-max rounded-full"
                            src={current_user.avatarUrl}
                            alt={current_user.email}
                            width={40}
                            height={40}
                          />
                        </span>
                        <div className="flex flex-col items-start">
                          <span className="text-xs">{current_user.email}</span>
                          <span className="text-xs opacity-70"></span>
                        </div>
                        <span>
                          <svg
                            stroke="currentColor"
                            fill="currentColor"
                            strokeWidth="0"
                            viewBox="0 0 16 16"
                            className="h-2"
                            height="1em"
                            width="1em"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z"></path>
                          </svg>
                        </span>
                      </span>
                    </div>
                  </button>
                )}
                position={'right'}
                origin={'top-50'}
              />
            </div>
          </span>
        </div>
      </div>
      <div className="flex justify-between items-center bg-white dark:bg-gray-900 dark:text-gray-100 border-b dark:border-gray-700">
        <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
          {app && (
            <MainMenu
              app={app}
              itemClass="h-16 inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-900 dark:bg-gray-900 dark:text-gray-100"
              selectedClass="h-16 inline-flex items-center border-b-2 border-brand px-1 pt-1 text-sm font-medium text-gray-900 dark:bg-gray-900 dark:text-gray-100"
              categories={null}
              displayLabel={displayLabel}
              current_section={current_section}
            />
          )}
        </div>
      </div>

      <div className="flex justify-between items-center bg-white dark:bg-gray-900 dark:text-gray-100 border-b dark:border-gray-700">
        <div className="text-2xl p-4 font-bold">{current_section}</div>
      </div>
    </div>
  );
}
