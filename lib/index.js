'use strict';

const GraphQL = require('graphql');
const Joi = require('joi');


class JoiBase extends GraphQL.GraphQLScalarType {
  constructor (name, type, serialize, options) {
    super({
      name,
      serialize,
      parseValue: validate,
      parseLiteral: validate
    });

    let schema = Joi[type]();
    options = options || {};
    Object.keys(options).forEach((key) => {
      const fn = schema[key];
      const params = options[key];
      if (typeof fn === 'function') {
        schema = Array.isArray(params) ? fn.call(schema, ...params) : fn.call(schema, params);
      }
    });

    function validate (ast) {
      if (Array.isArray(ast.values)) {
        ast.values = Joi.attempt(ast.values, schema);
        return ast.values;
      }

      ast.value = Joi.attempt(ast.value, schema);
      return ast.value;
    }
  }
}


exports.JoiAny = class JoiAny extends JoiBase {
  constructor (options) {
    super('JoiAny', 'any', (item) => item, options);
  }
};

exports.JoiArray = class JoiArray extends JoiBase {
  constructor (options) {
    super('JoiArray', 'array', Array.from, options);
  }
};

exports.JoiBoolean = class JoiBoolean extends JoiBase {
  constructor (options) {
    super('JoiBoolean', 'boolean', Boolean, options);
  }
};

exports.JoiDate = class JoiDate extends JoiBase {
  constructor (options) {
    super('JoiDate', 'date', Date, options);
  }
};

exports.JoiNumber = class JoiNumber extends JoiBase {
  constructor (options) {
    super('JoiNumber', 'number', (item) => item, options);
  }
};

exports.JoiString = class JoiString extends JoiBase {
  constructor (options) {
    super('JoiString', 'string', String, options);
  }
};


