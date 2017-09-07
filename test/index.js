'use strict';

const Graphql = require('graphql');
const Lab = require('lab');
const Scalars = require('../');

const { describe, it, expect } = exports.lab = Lab.script();
const { GraphQLObjectType, GraphQLSchema, GraphQLString } = Graphql;


describe('JoiAny()', () => {
  it('validates anything and doesn\'t require options', async () => {
    const schema = new GraphQLSchema({
      query: new GraphQLObjectType({
        name: 'RootQueryType',
        fields: {
          person: {
            type: GraphQLString,
            args: {
              name: { type: new Scalars.JoiAny() }
            },
            resolve: (root, (info, { name }) => name)
          }
        }
      })
    });

    const result1 = await Graphql.graphql(schema, `{ person(name: "roger") }`);
    expect(result1.data.person).to.equal('roger');
    const result2 = await Graphql.graphql(schema, `{ person(name: true) }`);
    expect(result2.data.person).to.equal('true');

    return Promise.resolve();
  });

  it('only executes functions available in joi', async () => {
    const schema = new GraphQLSchema({
      query: new GraphQLObjectType({
        name: 'RootQueryType',
        fields: {
          person: {
            type: GraphQLString,
            args: {
              name: { type: new Scalars.JoiAny({ whatever: true }) }
            },
            resolve: (root, (info, { name }) => name)
          }
        }
      })
    });

    const result1 = await Graphql.graphql(schema, `{ person(name: "roger") }`);
    expect(result1.data.person).to.equal('roger');
    const result2 = await Graphql.graphql(schema, `{ person(name: true) }`);
    expect(result2.data.person).to.equal('true');

    return Promise.resolve();
  });

  it('validates when there is a list of valids', async () => {
    const schema = new GraphQLSchema({
      query: new GraphQLObjectType({
        name: 'RootQueryType',
        fields: {
          person: {
            type: GraphQLString,
            args: {
              name: { type: new Scalars.JoiAny({ valid: ['roger', 'william'] }) }
            },
            resolve: (root, (info, { name }) => name)
          }
        }
      })
    });

    const result1 = await Graphql.graphql(schema, `{ person(name: "roger") }`);
    expect(result1.data.person).to.equal('roger');
    const result2 = await Graphql.graphql(schema, `{ person(name: "william") }`);
    expect(result2.data.person).to.equal('william');

    try {
      const invalid = await Graphql.graphql(schema, `{ person(name: "sarah") }`);
      expect(invalid).to.not.exist();
    } catch (err) {
      expect(err).to.be.error();
      expect(err.message).to.contain('[roger, william]');
    }

    return Promise.resolve();
  });
});


describe('JoiArray()', () => {
  it('validates min length', async () => {
    const schema = new GraphQLSchema({
      query: new GraphQLObjectType({
        name: 'RootQueryType',
        fields: {
          person: {
            type: GraphQLString,
            args: {
              items: { type: new Scalars.JoiArray({ min: 2 }) }
            },
            resolve: (root, (info, { items }) => items[0].value)
          }
        }
      })
    });

    const result1 = await Graphql.graphql(schema, `{ person(items: ["roger", "sarah", "eran"]) }`);
    expect(result1.data.person).to.contain('roger');

    try {
      const invalid = await Graphql.graphql(schema, `{ person(items: ["1"]) }`);
      expect(invalid).to.not.exist();
    } catch (err) {
      expect(err).to.be.error();
    }

    return Promise.resolve();
  });

  it('validates an expected length', async () => {
    const schema = new GraphQLSchema({
      query: new GraphQLObjectType({
        name: 'RootQueryType',
        fields: {
          person: {
            type: GraphQLString,
            args: {
              items: { type: new Scalars.JoiArray({ length: 1 }) }
            },
            resolve: (root, (info, { items }) => items[0].value)
          }
        }
      })
    });

    const result1 = await Graphql.graphql(schema, `{ person(items: ["roger"]) }`);
    expect(result1.data.person).to.contain('roger');

    try {
      const invalid = await Graphql.graphql(schema, `{ person(items: ["roger", "sarah", "eran"]) }`);
      expect(invalid).to.not.exist();
    } catch (err) {
      expect(err).to.be.error();
    }

    try {
      const invalid = await Graphql.graphql(schema, `{ person(items: "boo") }`);
      expect(invalid).to.not.exist();
    } catch (err) {
      expect(err).to.be.error();
    }

    return Promise.resolve();
  });
});


describe('JoiBoolean()', () => {
  it('validates truthy', async () => {
    const schema = new GraphQLSchema({
      query: new GraphQLObjectType({
        name: 'RootQueryType',
        fields: {
          person: {
            type: GraphQLString,
            args: {
              name: { type: new Scalars.JoiBoolean({ truthy: 'Y' }) }
            },
            resolve: (root, (info, { name }) => name)
          }
        }
      })
    });

    const result1 = await Graphql.graphql(schema, `{ person(name: "Y") }`);
    expect(result1.data.person).to.equal('true');

    const result2 = await Graphql.graphql(schema, `{ person(name: true) }`);
    expect(result2.data.person).to.equal('true');

    try {
      const invalid = await Graphql.graphql(schema, `{ person(name: "boo") }`);
      expect(invalid).to.not.exist();
    } catch (err) {
      expect(err).to.be.error();
    }

    return Promise.resolve();
  });
});

describe('JoiDate()', () => {
  it('validates date without any requirements', async () => {
    const schema = new GraphQLSchema({
      query: new GraphQLObjectType({
        name: 'RootQueryType',
        fields: {
          person: {
            type: GraphQLString,
            args: {
              birthday: { type: new Scalars.JoiDate() }
            },
            resolve: (root, (info, { birthday }) => birthday)
          }
        }
      })
    });

    const now = Date.now();
    const result1 = await Graphql.graphql(schema, `{ person(birthday: ${now}) }`);
    expect(result1.data.person).to.equal(new Date(now).toString());

    try {
      const invalid = await Graphql.graphql(schema, `{ person(birthday: "Infinity") }`);
      expect(invalid).to.not.exist();
    } catch (err) {
      expect(err).to.be.error();
    }

    return Promise.resolve();
  });

  it('validates date max value', async () => {
    const now = Date.now();
    const schema = new GraphQLSchema({
      query: new GraphQLObjectType({
        name: 'RootQueryType',
        fields: {
          person: {
            type: GraphQLString,
            args: {
              birthday: { type: new Scalars.JoiDate({ max: now }) }
            },
            resolve: (root, (info, { birthday }) => birthday)
          }
        }
      })
    });


    const result1 = await Graphql.graphql(schema, `{ person(birthday: ${now}) }`);
    expect(result1.data.person).to.equal(new Date(now).toString());

    try {
      const invalid = await Graphql.graphql(schema, `{ person(birthday: ${now + 100}) }`);
      expect(invalid).to.not.exist();
    } catch (err) {
      expect(err).to.be.error();
    }

    return Promise.resolve();
  });
});


describe('JoiNumber()', () => {
  it('validates min/max values', async () => {
    const schema = new GraphQLSchema({
      query: new GraphQLObjectType({
        name: 'RootQueryType',
        fields: {
          person: {
            type: GraphQLString,
            args: {
              age: { type: new Scalars.JoiNumber({ min: 2, max: 10 }) }
            },
            resolve: (root, (info, { age }) => age)
          }
        }
      })
    });

    const result = await Graphql.graphql(schema, `{ person(age: 5) }`);
    expect(result.data.person).to.equal('5');

    try {
      const invalid = await Graphql.graphql(schema, `{ person(age: "1") }`);
      expect(invalid).to.not.exist();
    } catch (err) {
      expect(err).to.be.error();
    }

    try {
      const invalid = await Graphql.graphql(schema, `{ person(age: 12) }`);
      expect(invalid).to.not.exist();
    } catch (err) {
      expect(err).to.be.error();
    }

    return Promise.resolve();
  });
});


describe('JoiString()', () => {
  it('validates min/max lengths', async () => {
    const schema = new GraphQLSchema({
      query: new GraphQLObjectType({
        name: 'RootQueryType',
        fields: {
          person: {
            type: GraphQLString,
            args: {
              name: { type: new Scalars.JoiString({ min: [2, 'utf8'], max: 10 }) }
            },
            resolve: (root, (info, { name }) => name)
          }
        }
      })
    });

    const result = await Graphql.graphql(schema, `{ person(name: "roger") }`);
    expect(result.data.person).to.equal('roger');

    try {
      const invalid = await Graphql.graphql(schema, `{ person(name: "1") }`);
      expect(invalid).to.not.exist();
    } catch (err) {
      expect(err).to.be.error('"value" length must be at least 2 characters long');
    }

    try {
      const invalid = await Graphql.graphql(schema, `{ person(name: "toolongofaname") }`);
      expect(invalid).to.not.exist();
    } catch (err) {
      expect(err).to.be.error('"value" length must be less than or equal to 10 characters long');
    }

    return Promise.resolve();
  });

  it('validates alphanum', async () => {
    const schema = new GraphQLSchema({
      query: new GraphQLObjectType({
        name: 'RootQueryType',
        fields: {
          person: {
            type: GraphQLString,
            args: {
              name: { type: Scalars.JoiString({ alphanum: true }) }
            },
            resolve: (root, (info, { name }) => name)
          }
        }
      })
    });

    const result = await Graphql.graphql(schema, `{ person(name: "roger") }`);
    expect(result.data.person).to.equal('roger');

    try {
      const invalid = await Graphql.graphql(schema, `{ person(name: "@@@") }`);
      expect(invalid).to.not.exist();
    } catch (err) {
      expect(err).to.be.error();
    }

    return Promise.resolve();
  });
});
