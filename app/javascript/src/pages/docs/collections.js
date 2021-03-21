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
    <div className="py-12 sm:px-6 md:px-24 bg-gray-100">
      {/* End hero unit */}
      <div className="md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
        {collections.map((card) => (
          <div className="m-4" item key={card.id} xs={12} sm={12} md={4}>
            <Card
              title={
                <Link
                  className={'classes.routeLink'}
                  color={'primary'}
                  to={`${lang}/collections/${card.slug}`}
                >
                  <p gutterBottom variant="h5" component="h3">
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
