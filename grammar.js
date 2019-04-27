const
prefixes = ["!","~"],
setters = ["=","+=","-=","*=","/=","%=","^=","=&"],
comparisons = ["==", "!=", "<", ">", "<=", ">=", "<:"],
boolean_operators = ["&","|","in","to"],
additive_operators = ["+","-"],
multiplicative_operators = ["*","/","%"],
exponential_operators = ["^"],
suffixes = [".","$","#","++","--"]


module.exports = grammar({
  name: 'teko',

  rules: {
    source_file: $ => repeat($.statement_with_semicolon),

    statement_with_semicolon: $ => seq(
      $.statement,
      ';'
    ),

    statement: $ => prec.right(choice(
      $.declaration,
      $.namespace,
      $.expression
    )),

    namespace: $ => seq(
      'namespace',
      $.codeblock
    ),

    declaration: $ => prec(2, seq(
      repeat($.annotation),
      optional('async'),
      optional('var'),
      $.prefix_expression,
      repeat(seq($.declared, ',')),
      $.declared
    )),

    annotation: $ => choice(
      '@IO',
      '@hangs',
      '@updates',
      seq('@sees',     $.annotation_params),
      seq('@modifies', $.annotation_params),
      seq('@throws',   $.annotation_params)
    ),

    annotation_params: $ => seq(
      repeat(seq($.label, ',')),
      $.label
    ),

    declared: $ => seq(
      $.label,
      optional($.assignment_predicate)
    ),

    assignment_predicate: $ => choice(
      seq(
        choice(...setters),
        $.expression
      ),
      seq(
        '->',
        $.codeblock
      )
    ),

    codeblock: $ => choice(
      $.statement,
      seq(
        '{',
        repeat($.statement_with_semicolon),
        '}'
      )
    ),

    expression: $ => choice(
      seq(
        $.tight_expression,
        $.assignment_predicate
      ),
      $.comparison_expression,
      $.if_expression,
      $.for_expression,
      $.while_expression
    ),

    comparison_expression: $ => seq(
      optional(seq(
        $.comparison_expression,
        choice(...comparisons)
      )),
      $.boolean_expression
    ),

    boolean_expression: $ => seq(
      optional(seq(
        $.boolean_expression,
        choice(...boolean_operators)
      )),
      $.additive_expression
    ),

    additive_expression: $ => seq(
      optional(seq(
        $.additive_expression,
        choice(...additive_operators)
      )),
      $.multiplicative_expression
    ),

    multiplicative_expression: $ => seq(
      optional(seq(
        $.multiplicative_expression,
        choice(...multiplicative_operators)
      )),
      $.exponential_expression
    ),

    exponential_expression: $ => seq(
      optional(seq(
        $.exponential_expression,
        choice(...exponential_operators)
      )),
      $.prefix_expression
    ),

    prefix_expression: $ => seq(
      optional(choice(...prefixes)),
      $.tight_expression
    ),

    tight_expression: $ => prec(1, choice(
      $.atomic_expression,
      $.attribute,
      seq($.tight_expression, choice(...suffixes)),
      $.struct,
      $.args,
      $.sequence
    )),

    attribute: $ => prec(2, choice (
      seq($.tight_expression, '.', $.label),
      seq($.tight_expression, $.args),
      seq($.tight_expression, $.sequence)
    )),

    struct: $ => seq(
      "(",
      repeat(seq(
        $.struct_elem,
        ","
      )),
      $.struct_elem,
      ")"
    ),

    struct_elem: $ => seq(
      $.prefix_expression,
      $.label,
      optional(seq(
        "?",
        $.expression
      ))
    ),

    args: $ => seq(
      "(",
      optional(seq(
        repeat(seq(
          $.arg,
          ","
        )),
        $.arg
      )),
      ")"
    ),

    arg: $ => seq(
      prec(1,optional(seq(
        $.label,
        "="
      ))),
      $.expression
    ),

    sequence: $ => prec(-1, choice(
      seq(
        "{",
        optional($.sequence_body),
        "}"
      ),
      seq(
        "[",
        optional($.sequence_body),
        "]"
      )
    )),

    sequence_body: $ => seq(
      repeat(seq(
        $.expression,
        ","
      )),
      $.expression
    ),

    atomic_expression: $ => choice(
      $.known_type,
      $.label,
      $.string,
      $.char,
      $.num,
      $.bool,
      $.bits,
      $.bytes
    ),

    known_type: $ => choice(
      'let',
      'type',
      'obj',
      'int',
      'real',
      'str',
      'char',
      'bool',
      'bits',
      'bytes',
      'label',
      'unit',
      'struct',
      'enum'
    ),

    label: $ => /[a-zA-Z_][a-zA-Z0-9_]*/,

    string: $ => seq(
      '"',
      repeat($.character),
      '"'
    ),

    char: $ => seq(
      "'",
      $.character,
      "'"
    ),

    character: $ => token.immediate(choice(
      prec(1, /[^"\n\\]/),
      '\\\\',
      '\\"',
      "\\'",
      "\\n",
      "\\t",
      /\\x[0-9a-fA-F]{2}/
    )),

    num: $ => /-?[0-9]+\.?[0-9]*/,

    bool: $ => choice('true','false'),

    bits: $ => /0b[01]+/,

    bytes: $ => /0x[0-9a-fA-F]+/,

    if_expression: $ => prec.right(seq(
      choice(
        prec(-1, seq(
          $.expression,
          "?"
        )),
        seq(
          "if",
          $.expression
        )
      ),
      $.codeblock,
      optional(seq(
        choice(":","else"),
        $.codeblock
      ))
    )),

    while_expression: $ => seq(
      "while",
      $.expression,
      $.codeblock
    ),

    for_expression: $ => seq(
      choice("for","parallel"),
      choice(
        $.for_setup,
        seq(
          "(",
          $.for_setup,
          ")"
        )
      ),
      $.codeblock
    ),

    for_setup: $ => prec(1, seq(
      optional($.prefix_expression),
      $.label,
      "in",
      $.expression
    ))
  }
});
