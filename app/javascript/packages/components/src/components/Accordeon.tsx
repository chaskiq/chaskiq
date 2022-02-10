import React from 'react';
import Button from './Button';
import { DownArrow, UpArrow } from './icons';

type IPanelItem = {
  name: string;
  value?: string;
};

type IPanel = {
  name: string;
  items?: Array<IPanelItem>;
  component?: React.ReactElement;
};

type PanelProps = {
  items: Array<IPanel>;
};

export default function CustomizedExpansionPanels(props: PanelProps) {
  const [expanded, setExpanded] = React.useState(props.items[0].name);

  const withValues = (col) => {
    return col.filter((o) => o.value);
  };

  const expandedClasses = (o) => {
    if (expanded === o.name) {
      return 'border-r-4 bg-grey-lightest border-gray-800';
    } else {
      return 'border-r-4 border-transparent';
    }
  };

  const isExpanded = (o) => {
    return expanded === o.name;
  };

  function toggleExpanded(name) {
    if (expanded === name) {
      setExpanded(null);
      return;
    }
    setExpanded(name);
  }

  return (
    <section className="shadow">
      {props.items.map((o, i) => (
        <article
          className="border-b"
          key={`expansion-panel-${i}`}
          // square
          // expanded={expanded === o.name}
          // onChange={handleChange(o.name)}
        >
          <div
            className={expandedClasses(o)}
            aria-controls={`${o.name}-content`}
            id="panel1d-header"
          >
            <header
              onClick={() => {
                toggleExpanded(o.name);
              }}
              className="flex justify-between items-center p-5 pl-6 pr-8 cursor-pointer select-none"
            >
              <span className="text-sm leading-5 font-medium text-gray-500 dark:text-gray-100 sm:w-40 sm:flex-shrink-0 lg:w-48">
                {o.name}
              </span>

              {isExpanded(o) && (
                <Button
                  onClick={() => {
                    toggleExpanded(o.name);
                  }}
                  variant="outlined"
                >
                  <UpArrow />
                </Button>
              )}

              {!isExpanded(o) && (
                <Button
                  onClick={() => {
                    toggleExpanded(o.name);
                  }}
                  variant="outlined"
                >
                  <DownArrow />
                </Button>
              )}
            </header>

            {isExpanded(o) && (
              <div>
                <div className="pl-4 pr-4 pb-5 text-grey-darkest">
                  {o.items ? (
                    <ul className="pl-4">
                      {withValues(o.items).map((item, index) => (
                        <li
                          key={`expanded-${index}`}
                          className="flex justify-start"
                        >
                          <p className="mr-2 pb-2 text-sm leading-5 text-gray-500 dark:text-gray-400">
                            {item.label || item.name}
                          </p>
                          <p className="text-sm leading-5 text-gray-900 dark:text-gray-50">
                            {item.value}
                          </p>
                        </li>
                      ))}
                    </ul>
                  ) : null}

                  {o.component ? o.component : null}
                </div>
              </div>
            )}
          </div>
        </article>
      ))}
    </section>
  );
}
