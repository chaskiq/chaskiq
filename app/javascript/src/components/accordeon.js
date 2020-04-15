import React from "react";

function CustomizedExpansionPanels(props) {
  const [expanded, setExpanded] = React.useState(props.items[0].name);

  const handleChange = (panel) => (event, newExpanded) => {
    setExpanded(newExpanded ? panel : false);
  };

  const withValues = (col) => {
    return col.filter((o) => o.value);
  };

  const expandedClasses = (o) => {
    if (expanded === o.name) {
      return "border-l-2 bg-grey-lightest border-indigo-600";
    } else {
      return "border-l-2 border-transparent";
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
          square
          expanded={expanded === o.name}
          onChange={handleChange(o.name)}
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
              className="flex justify-between items-center p-5 pl-8 pr-8 cursor-pointer select-none"
            >
              <span className="text-sm leading-5 font-medium text-gray-900">
                {o.name}
              </span>

              {isExpanded(o) && (
                <button
                  onClick={() => {
                    toggleExpanded(o.name);
                  }}
                  className="rounded-full border border border-indigo-400 w-7 h-7 flex items-center justify-center bg-indigo-600"
                >
                  <svg
                    aria-hidden="true"
                    data-reactid="281"
                    fill="none"
                    height="24"
                    stroke="white"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    width="24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <polyline points="18 15 12 9 6 15"></polyline>
                  </svg>
                </button>
              )}

              {!isExpanded(o) && (
                <button
                  onClick={() => {
                    toggleExpanded(o.name);
                  }}
                  className="rounded-full border border-grey w-7 h-7 flex items-center justify-center"
                >
                  <svg
                    aria-hidden="true"
                    className=""
                    data-reactid="266"
                    fill="none"
                    height="24"
                    stroke="#606F7B"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewbox="0 0 24 24"
                    width="24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </button>
              )}
            </header>

            {isExpanded(o) && (
              <div>
                <div className="pl-4 pr-4 pb-5 text-grey-darkest">
                  {o.items ? (
                    <ul className="pl-4">
                      {withValues(o.items).map((item, index) => (
                        <React.Fragment>
                          <p className="pb-2 text-sm leading-5 text-gray-500">
                            {item.label}
                          </p>
                          <p className="text-sm leading-5 text-gray-900">
                            {item.value}
                          </p>
                        </React.Fragment>
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

export default CustomizedExpansionPanels;
