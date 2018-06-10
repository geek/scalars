'use strict';

const GraphQL = require('graphql');
const Joi = require('joi');


class JoiBase extends GraphQL.GraphQLScalarType {
  constructor (name, type, serialize, options) {
    super({
      name,
      description: name,
      serialize: serializeValidate,
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

    function serializeValidate (value) {
      return validate({ value: serialize(value) });
    }

    function validate (ast) {
      try {
        if (Array.isArray(ast.values)) {
          ast.values = Joi.attempt(ast.values, schema);
          return ast.values;
        }

        ast.value = Joi.attempt(ast.value, schema);
        return ast.value;
      } catch (err) {
        return err;
      }
    }
  }
}


class JoiAny extends JoiBase {
  constructor (options) {
    super('JoiAny', 'any', (value) => {
      return value;
    }, options);
  }
}

exports.JoiAny = function (options) {
  return new JoiAny(options);
};


class JoiArray extends JoiBase {
  constructor (options) {
    super('JoiArray', 'array', Array.from, options);
  }
}

exports.JoiArray = function (options) {
  return new JoiArray(options);
};


class JoiBoolean extends JoiBase {
  constructor (options) {
    super('JoiBoolean', 'boolean', Boolean, options);
  }
}

exports.JoiBoolean = function (options) {
  return new JoiBoolean(options);
};


class JoiDate extends JoiBase {
  constructor (options) {
    super('JoiDate', 'date', Date, options);
  }
}

exports.JoiDate = function (options) {
  return new JoiDate(options);
};


class JoiNumber extends JoiBase {
  constructor (options) {
    super('JoiNumber', 'number', Number, options);
  }
}

exports.JoiNumber = function (options) {
  return new JoiNumber(options);
};


class JoiString extends JoiBase {
  constructor (options) {
    super('JoiString', 'string', String, options);
  }
}

exports.JoiString = function (options) {
  return new JoiString(options);
};
