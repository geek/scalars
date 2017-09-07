# scalars
GraphQL Joi Scalars

[![Build Status](https://secure.travis-ci.org/geek/scalars.svg)](http://travis-ci.org/geek/scalars)

### Usage Example

```javascript
const Graphi = require('graphi);
const Hapi = require('hapi');
const { JoiString } = require('scalars');

const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
      person: {
        type: GraphQLString,
        args: {
          username: { type: JoiString({ min: [2, 'utf8'], max: 10, alphanum: true, required: true }) },
          password: { type: JoiString({ regex: /^[a-zA-Z0-9]{3,30}$/ }) },
          email: { type: JoiString({ email: true }) }
        },
        resolve: (root, { username, password, email }, request) => {
          return Promise.resolve(firstname);
        }
      }
    }
  })
});

const server = new Hapi.Server();
server.connection();
server.register({ register: Graphi, options: { schema } }, (err) => {
  // server is ready to be started
});
```


## Scalars

### JoiAny

Supports all of the [Joi Any](https://github.com/hapijs/joi/blob/v10.6.0/API.md#any) options, passed as an object with arguments.


### JoiArray

### JoiBoolean

### JoiDate

### JoiNumber

### JoiString

Supports all of the [Joi String](https://github.com/hapijs/joi/blob/v10.6.0/API.md#string---inherits-from-any) options, passed as an object with arguments.

Examples
```js
const username = JoiString({ min: [2, 'utf8'], max: 10, alphanum: true, required: true });
const password = JoiString({ regex: /^[a-zA-Z0-9]{3,30}$/ });
const email =  JoiString({ email: true });
```
