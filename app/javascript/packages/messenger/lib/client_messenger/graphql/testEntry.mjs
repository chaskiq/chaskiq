
import {
    AUTH,
    PING,
    CONVERT,
    CONVERSATIONS,
    CONVERSATION,
    INSERT_COMMMENT,
    START_CONVERSATION,
    ARTICLE_SETTINGS,
    ARTICLES,
    SEARCH_ARTICLES,
    ARTICLES_UNCATEGORIZED,
    ARTICLE,
    ARTICLE_COLLECTIONS,
    ARTICLE_COLLECTION,
    ARTICLE_COLLECTION_WITH_SECTIONS,
    APP_PACKAGE_HOOK
} from './queries.mjs'

// example
// npx babel-node ./app/javascript/src/graphql/entry.mjs APPS
var myArgs = process.argv.slice(2);
//console.log('myArgs: ', myArgs);
console.log(eval(myArgs[0]))