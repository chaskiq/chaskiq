import graphql from '../../graphql/client'
import {
  APP_PACKAGE_HOOK
} from '../../graphql/queries'

export function getPackage (data, location, cb) {
  graphql(APP_PACKAGE_HOOK,
    {
      ...data,
      location: location // inbox, conversation, bla
    },
    {
      success: (data) => {
        cb && cb(data)
      },
      error: (error) => { console.log('error getting package', error) }
    })
}
