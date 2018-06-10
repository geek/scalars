'use strict';

const Code = require('code');
const Graphql = require('graphql');
const Lab = require('lab');
const Scalars = require('../');


const { describe, it } = exports.lab = Lab.script();
const { expect } = Code;
const { GraphQLObjectType, GraphQLSchema, GraphQLString } = Graphql;


describe('JoiAny()', () => {
  it('validates anything and doesn\'t require options', async () => {
    const schema = new GraphQLSchema({
      query: new GraphQLObjectType({
        name: 'RootQueryType',
        fields: {
          person: {
            type: Scalars.JoiString(),
            args: {
              name: { type: Scalars.JoiAny() }
            },
            resolve: (root, (info, { name }) => {
              return name;
            })
          }
        }
      })
    });

    const result1 = await Graphql.graphql(schema, '{ person(name: "roger") }');
    expect(result1.data.person).to.equal('roger');
    const result2 = await Graphql.graphql(schema, '{ person(name: true) }');
    expect(result2.data.person).to.equal('true');
    const result3 = await Graphql.graphql(schema, '{ person(name: 1) }');
    expect(result3.data.person).to.equal('1');
  });

  it('only executes functions available in joi', async () => {
    const schema = new GraphQLSchema({
      query: new GraphQLObjectType({
        name: 'RootQueryType',
        fields: {
          person: {
            type: GraphQLString,
            args: {
              name: { type: Scalars.JoiAny({ whatever: true }) }
            },
            resolve: (root, (info, { name }) => {
              return name;
            })
          }
        }
      })
    });

    const result1 = await Graphql.graphql(schema, '{ person(name: "roger") }');
    expect(result1.data.person).to.equal('roger');
    const result2 = await Graphql.graphql(schema, '{ person(name: true) }');
    expect(result2.data.person).to.equal('true');
  });

  it('validates when there is a list of valids', async () => {
    const schema = new GraphQLSchema({
      query: new GraphQLObjectType({
        name: 'RootQueryType',
        fields: {
          person: {
            type: GraphQLString,
            args: {
              name: { type: Scalars.JoiAny({ valid: ['roger', 'william', true] }) }
            },
            resolve: (root, (info, { name }) => {
              return name;
            })
          }
        }
      })
    });

    const result1 = await Graphql.graphql(schema, '{ person(name: "roger") }');
    expect(result1.data.person).to.equal('roger');
    const result2 = await Graphql.graphql(schema, '{ person(name: "william") }');
    expect(result2.data.person).to.equal('william');

    try {
      const invalid = await Graphql.graphql(schema, '{ person(name: "sarah") }');
      expect(invalid).to.not.exist();
    } catch (err) {
      expect(err).to.be.error();
      expect(err.message).to.contain('[roger, william, true]');
    }

    try {
      const invalid = await Graphql.graphql(schema, '{ person(name: 1) }');
      expect(invalid).to.not.exist();
    } catch (err) {
      expect(err).to.be.error();
      expect(err.message).to.contain('[roger, william, true]');
    }
  });

  it('serialize returns whatever is passed as an argument', () => {
    const scalar = Scalars.JoiAny();

    const result1 = scalar.serialize(1);
    expect(result1).to.equal(1);

    const result2 = scalar.serialize(null);
    expect(result2).to.equal(null);
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
              items: { type: Scalars.JoiArray({ min: 2 }) }
            },
            resolve: (root, (info, { items }) => {
              return items[0].value;
            })
          }
        }
      })
    });

    const result1 = await Graphql.graphql(schema, '{ person(items: ["roger", "sarah", "eran"]) }');
    expect(result1.data.person).to.contain('roger');

    try {
      const invalid = await Graphql.graphql(schema, '{ person(items: ["1"]) }');
      expect(invalid).to.not.exist();
    } catch (err) {
      expect(err).to.be.error();
    }
  });

  it('validates an expected length', async () => {
    const schema = new GraphQLSchema({
      query: new GraphQLObjectType({
        name: 'RootQueryType',
        fields: {
          person: {
            type: GraphQLString,
            args: {
              items: { type: Scalars.JoiArray({ length: 1 }) }
            },
            resolve: (root, (info, { items }) => {
              return items[0].value;
            })
          }
        }
      })
    });

    const result1 = await Graphql.graphql(schema, '{ person(items: ["roger"]) }');
    expect(result1.data.person).to.contain('roger');

    try {
      const invalid = await Graphql.graphql(schema, '{ person(items: ["roger", "sarah", "eran"]) }');
      expect(invalid).to.not.exist();
    } catch (err) {
      expect(err).to.be.error();
    }

    try {
      const invalid = await Graphql.graphql(schema, '{ person(items: "boo") }');
      expect(invalid).to.not.exist();
    } catch (err) {
      expect(err).to.be.error();
    }
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
              name: { type: Scalars.JoiBoolean({ truthy: 'Y' }) }
            },
            resolve: (root, (info, { name }) => {
              return name;
            })
          }
        }
      })
    });

    const result1 = await Graphql.graphql(schema, '{ person(name: "Y") }');
    expect(result1.data.person).to.equal('true');

    const result2 = await Graphql.graphql(schema, '{ person(name: true) }');
    expect(result2.data.person).to.equal('true');

    try {
      const invalid = await Graphql.graphql(schema, '{ person(name: "boo") }');
      expect(invalid).to.not.exist();
    } catch (err) {
      expect(err).to.be.error();
    }
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
              birthday: { type: Scalars.JoiDate() }
            },
            resolve: (root, (info, { birthday }) => {
              return birthday;
            })
          }
        }
      })
    });

    const now = Date.now();
    const result1 = await Graphql.graphql(schema, `{ person(birthday: ${now}) }`);
    expect(result1.data.person).to.equal(new Date(now).toString());

    try {
      const invalid = await Graphql.graphql(schema, '{ person(birthday: "Infinity") }');
      expect(invalid).to.not.exist();
    } catch (err) {
      expect(err).to.be.error();
    }
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
              birthday: { type: Scalars.JoiDate({ max: now }) }
            },
            resolve: (root, (info, { birthday }) => {
              return birthday;
            })
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
  });
});


describe('JoiNumber()', () => {
  it('validates that value is a number', async () => {
    const schema = new GraphQLSchema({
      query: new GraphQLObjectType({
        name: 'RootQueryType',
        fields: {
          person: {
            type: GraphQLString,
            args: {
              age: { type: Scalars.JoiNumber() }
            },
            resolve: (root, (info, { age }) => {
              return age;
            })
          }
        }
      })
    });

    const result1 = await Graphql.graphql(schema, '{ person(age: 5) }');
    expect(result1.data.person).to.equal('5');

    const result2 = await Graphql.graphql(schema, '{ person(age: "5") }');
    expect(result2.data.person).to.equal('5');

    try {
      const invalid = await Graphql.graphql(schema, '{ person(age: "boo") }');
      expect(invalid).to.not.exist();
    } catch (err) {
      expect(err).to.be.error();
    }

    try {
      const invalid = await Graphql.graphql(schema, '{ person(age: true) }');
      expect(invalid).to.not.exist();
    } catch (err) {
      expect(err).to.be.error();
    }
  });

  it('validates min/max values', async () => {
    const schema = new GraphQLSchema({
      query: new GraphQLObjectType({
        name: 'RootQueryType',
        fields: {
          person: {
            type: GraphQLString,
            args: {
              age: { type: Scalars.JoiNumber({ min: 2, max: 10 }) }
            },
            resolve: (root, (info, { age }) => {
              return age;
            })
          }
        }
      })
    });

    const result1 = await Graphql.graphql(schema, '{ person(age: 5) }');
    expect(result1.data.person).to.equal('5');

    const result2 = await Graphql.graphql(schema, '{ person(age: "5") }');
    expect(result2.data.person).to.equal('5');

    try {
      const invalid = await Graphql.graphql(schema, '{ person(age: "1") }');
      expect(invalid).to.not.exist();
    } catch (err) {
      expect(err).to.be.error();
    }

    try {
      const invalid = await Graphql.graphql(schema, '{ person(age: 12) }');
      expect(invalid).to.not.exist();
    } catch (err) {
      expect(err).to.be.error();
    }
  });

  it('serializes numbers', () => {
    const scalar = Scalars.JoiNumber();

    const result1 = scalar.serialize(1);
    expect(result1).to.equal(1);
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
              name: { type: Scalars.JoiString({ min: [2, 'utf8'], max: 10 }) }
            },
            resolve: (root, (info, { name }) => {
              return name;
            })
          }
        }
      })
    });

    const result = await Graphql.graphql(schema, '{ person(name: "roger") }');
    expect(result.data.person).to.equal('roger');

    let invalid = await Graphql.graphql(schema, '{ person(name: "1") }');
    expect(invalid.errors[0]).to.be.error();

    invalid = await Graphql.graphql(schema, '{ person(name: "toolongofaname") }');
    expect(invalid.errors[0]).to.be.error();
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
            resolve: (root, (info, { name }) => {
              return name;
            })
          }
        }
      })
    });

    const result = await Graphql.graphql(schema, '{ person(name: 1) }');
    expect(result.data.person).to.equal('1');

    try {
      const invalid = await Graphql.graphql(schema, '{ person(name: "@@@") }');
      expect(invalid).to.not.exist();
    } catch (err) {
      expect(err).to.be.error();
    }
  });
});
