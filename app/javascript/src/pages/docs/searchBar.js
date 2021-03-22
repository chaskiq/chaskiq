import React from 'react'
import graphql from '../../graphql/client'
import { SEARCH_ARTICLES } from '../../graphql/docsQueries'
import List, { ListItem, ListItemText } from '../../components/List'
import { Link } from 'react-router-dom'

export default function CustomizedInputBase ({ lang, _history, subdomain, settings }) {
  const [results, setResults] = React.useState([])
  const [anchorEl, setAnchorEl] = React.useState(null)

  function search (term) {
    graphql(
      SEARCH_ARTICLES,
      {
        domain: subdomain,
        term: term,
        lang: lang,
        page: 1
      },
      {
        success: (data) => {
          setResults(data.helpCenter.search.collection)
        },
        error: () => {
        }
      }
    )
  }

  function handleReturn (e) {
    e.persist()
    // console.log(e.key)
    if (e.key === 'Enter') {
      // e.preventDefault()
      search(e.target.value)
      setAnchorEl(anchorEl ? null : e.target)
    }
  }

  return (
    <div className="flex justify-center">
      <div className="w-full lg:w-4/5 mt-4 mb-8">

        <p
          className={
            'py-3 text-left text-2xl lg:text-3xl leading-9 font-light text-gray-100 md:mx-24-'
          }
        >
          {settings.siteDescription}
        </p>

        <div className="relative">
          <svg
            className="absolute top-0 ml-4 mt-2 lg:mt-2 lg:ml-3 w-8 h-6 text-gray-600"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>

          <input
            className="text-1xl lg:text-1xl placeholder-gray-600 text-gray-800 pb-2 pt-2 pl-20 pr-2 rounded  w-full border-b-4 focus:outline-none focus:border-blue-800"
            type="text"
            placeholder="Search in articles"
            onKeyPress={handleReturn}
          />

          {results && (
            <div className="absolute w-full">
              <List>
                {results.map((o) => (
                  <ListItem key={`search-result-${o.slug}`}>
                    <ListItemText
                      primary={
                        <Link
                          onClick={() => setResults([])}
                          to={`/${lang}/articles/${o.slug}`}
                        >
                          {o.title}
                        </Link>
                      }
                      // secondary={'sks'}
                    />
                  </ListItem>
                ))}
              </List>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
