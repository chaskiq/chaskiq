import React from 'react'
import graphql from '../../graphql/client'
import {

  ARTICLE_COLLECTIONS
} from '../../graphql/docsQueries'

import Card from '../../components/Card'

import { Link } from 'react-router-dom'

import translation from './translation'

export default function Collections ({ lang, subdomain }) {
  const [collections, setCollections] = React.useState([])
  const [_error, setError] = React.useState(false)

  React.useEffect(() => {
    getArticles()
  }, [lang])

  function getArticles () {
    graphql(
      ARTICLE_COLLECTIONS,
      {
        domain: subdomain,
        lang: lang
      },
      {
        success: (data) => {
          setCollections(data.helpCenter.collections)
          if (!data.helpCenter.collections) {
            setError('not_found')
          }
        },
        error: () => {}
      }
    )
  }

  function truncateOnWord (str, num) {
    if (!str) return ''
    if (str.length > num) {
      return str.slice(0, num) + '...'
    } else {
      return str
    }
  }

  return (
    <div className="py-12 sm:px-6 md:px-64 bg-gray-100">
      {/* End hero unit */}
      <div className="md:grid md:grid-cols-3 md:gap-x-4 md:gap-y-10">
        {collections.map((card) => (
          <div className="m-4" item key={card.id}>
            <Card
              title={
                <Link
                  className={'hover:underline'}
                  color={'primary'}
                  to={`${lang}/collections/${card.slug}`}
                >
                  {card.icon && 
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-white bg-opacity-10">
                      <img src={card.icon} />
                    </div>
                  }

                  <p className="mt-2 text-base">
                    {translation(card.title)}
                  </p>
                </Link>
              }
              description={truncateOnWord(card.description, 120)}
            ></Card>

            {/* <Card className={classes.card}>

              <CardContent className={classes.cardContent}>

                <p>
                  {truncateOnWord(card.description, 120)}
                </p>

              </CardContent>

            </Card> */}
          </div>
        ))}
      </div>
    </div>
  )
}
