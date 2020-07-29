import React from 'react'
import graphql from '../../graphql/client'
import { SEARCH_ARTICLES } from '../../graphql/docsQueries'
import List, { ListItem, ListItemText } from '../../components/List'
import { Link } from 'react-router-dom'

export default function CustomizedInputBase ({ lang, history, subdomain }) {
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
          debugger
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
        <div className="relative">
          <svg
            className="absolute top-0 ml-4 mt-4 lg:mt-6 lg:ml-6 w-8 h-8 text-gray-600"
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
            className="text-1xl lg:text-3xl placeholder-gray-600 text-gray-800 pb-4 pt-5 pl-20 pr-4 rounded w-full border-b-4 focus:outline-none focus:border-blue-800"
            type="text"
            placeholder="Search in articles"
            onKeyPress={handleReturn}
          />

          {results && (
            <div className="absolute w-full">
              <List>
                {results.map((o) => (
                  <ListItem>
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
