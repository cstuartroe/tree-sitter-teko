module.exports = grammar({
  name: 'teko',

  word: $ => $.label,

  extras: $ => [$.line_comment, /\s/],

  rules: {
    source_file: $ => repeat($.statement_with_semicolon),

    line_comment: $ => seq('//', /.*/),

    statement_with_semicolon: $ => seq(
      $.statement,
      optional(';'),
      optional(/\n/), // not sure why I need this but it breaks if I remove it
    ),

    statement: $ => choice(
      $.expression,
      $.type_definition,
    ),

    type_definition: $ => seq(
      "type",
      $.label,
      "=",
      $.expression,
    ),

    expression: $ => choice(
      $.simple_expression,
      $.tuple,
      $.array,
      $.set,
      $.map,
      $.object,
      $.function_definition,
      $.block_expression,
      $.call,
      $.attribute,
      $.comparison_expression,
      $.add_sub_expression,
      $.mult_div_expression,
      $.exp_expression,
      $.suffix_expression,
      $.if_expression,
      $.declaration,
      $.update,
    ),

    simple_expression: $ => prec(6, choice(
      $.label,
      $.string,
      $.char,
      $.num,
      $.bool,
    )),

    tuple: $ => seq(
      "(",
      repeat(seq(
        $.expression,
        ",",
      )),
      optional($.expression),
      ")",
    ),

    array: $ => seq(
      "[",
      repeat(seq(
        $.expression,
        ",",
      )),
      optional($.expression),
      "]",
    ),

    set: $ => seq(
      "set",
      "{",
      repeat(seq(
        $.expression,
        ",",
      )),
      optional($.expression),
      "}",
    ),

    key_value: $ => seq(
      $.expression,
      ":",
      $.expression,
    ),

    map: $ => seq(
      "map",
      "{",
      repeat(seq(
        $.key_value,
        ",",
      )),
      optional($.key_value),
      "}",
    ),

    object_field: $ => seq(
      $.label,
      ":",
      $.expression,
    ),

    object: $ => seq(
      "{",
      repeat(seq(
        $.object_field,
        ",",
      )),
      optional($.object_field),
      "}",
    ),

    argdef: $ => seq(
      $.label,
      optional(seq(
        ":",
        $.expression,
      )),
    ),

    codeblock: $ => seq(
      '{',
      repeat($.statement_with_semicolon),
      '}',
    ),

    function_definition: $ => prec.left(0, seq(
      "fn",
      optional($.label),
      "(",
      repeat(seq(
        $.argdef,
        ",",
      )),
      optional($.argdef),
      ")",
      optional(seq(
        ":",
        $.expression,
      )),
      choice(
        $.codeblock,
        seq(
          "->",
          $.expression,
        )
      )
    )),

    block_expression: $ => seq(
      choice("do", "scope"),
      $.codeblock,
    ),

    call: $ => prec.left(5, seq(
      $.expression,
      "(",
      repeat(seq(
        $.expression,
        ",",
      )),
      optional($.expression),
      ")",
    )),

    attribute: $ => prec.left(6, seq(
      $.expression,
      ".",
      $.label,
    )),

    comparison_expression: $ => prec.left(1, seq(
      $.expression,
      choice("==", "!=", "<", ">", "<=", ">=", "<:"),
      $.expression,
    )),

    add_sub_expression: $ => prec.left(2, seq(
      $.expression,
      choice("+","-","&","|"),
      $.expression,
    )),

    mult_div_expression: $ => prec.left(3, seq(
      $.expression,
      choice("*","/","%"),
      $.expression,
    )),

    exp_expression: $ => prec.left(4, seq(
      $.expression,
      choice("^"),
      $.expression,
    )),

    suffix_expression: $ => prec.left(5, seq(
      $.expression,
      choice(".","$","#","?"),
    )),

    if_expression: $ => prec.left(0, seq(
      "if",
      $.expression,
      optional("then"),
      $.expression,
      optional(seq(
        "else",
        $.expression,
      ))
    )),

    declaration: $ => prec.left(0, seq(
      $.label,
      ":",
      optional($.expression),
      "=",
      $.expression,
    )),

    updater: $ => choice("<-","+=","-=","*=","/=","%=","^="),

    update: $ => prec.left(0, seq(
      $.label,
      $.updater,
      $.expression,
    )),

    label: $ => /[a-zA-Z_][a-zA-Z0-9_]*/,

    string: $ => seq(
      '"',
      repeat(choice($.character, "'")),
      '"'
    ),

    char: $ => seq(
      "'",
      choice($.character, "\""),
      "'"
    ),

    character: $ => token.immediate(choice(
      prec(1, /[^"'\n\\]/),
      '\\\\',
      '\\"',
      "\\'",
      "\\n",
      "\\t",
      /\\x[0-9a-fA-F]{2}/
    )),

    num: $ => /-?\s*[0-9]+\.?[0-9]*/,

    bool: $ => choice('true','false'),
  }
});
