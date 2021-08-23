// npx ts-node app/javascript/packages/store/src/graphql/testEntry.ts Up

enum Direction {
  Up = 1,
  Down = 2,
  Left = 3,
  Right = 4,
}


// example
// npx babel-node ./app/javascript/src/graphql/entry.mjs APPS
var myArgs = process.argv.slice(2)
//console.log('myArgs: ', myArgs);
console.log(Direction[myArgs[0]])
