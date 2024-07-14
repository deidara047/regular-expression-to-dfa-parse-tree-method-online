%{
function hexlify (str:string): string { // elide TS types for js-compatibility
  return str.split('').map(ch => '0x' + ch.charCodeAt(0).toString(16)).join(', ')
}
%}

%lex
%no-break-if          (.*[^a-z] | '') 'return' ([^a-z].* | '') // elide trailing 'break;'

%%

\s+                         if (yy.trace) yy.trace(`skipping whitespace ${hexlify(yytext)}`)
"*"|"∗"                     return '*'
"+"                         return '+'
"|"|"∣"                      return '|'
"?"                         return '?'
"("                         return '('
")"                         return ')'
"ε"|"ϵ"|"''"|\"\"           return 'EPSILON'
[^?\+\*\(\)"|""∣""'"\"\\\n\r\t] return 'CHAR'
<<EOF>>                     return 'EOF'
.                           return 'INVALID'

/lex

/* Parser options */
%parse-param params_obj

/* Grammar definition */
%start expressions

%%

expressions
    : expr EOF
        { return $1; }
    | error EOF
        {
          params_obj.errors.push({
            type: 'syntax',
            message: 'Syntax error in expression',
            location: @1
          });
          return '';
        }
    ;

expr
    : term
        { $$ = $1; }
    | expr '|' term
        { $$ = $1 + '|' + $3; }
    ;

term
    : factor
        { $$ = $1; }
    | term factor
        { $$ = $1 + $2; }
    ;

factor
    : base
        { $$ = $1; }
    | base '*'
        { $$ = $1 + '*'; }
    | base '+'
        { $$ = params_obj.checkbox2 === true ? $1 + $1 + '*' : $1 + '+'; }
    | base '?'
        { 
          $$ = params_obj.checkbox1 === true ? '(' + $1 + '|ε)' : $1 + '?'; 
        }
    ;

base
    : '(' expr ')'
        { $$ = '(' + $2 + ')'; }
    | EPSILON
        { $$ = ($1 == "''" || $1 == '""') ? 'ε' : $1}
    | CHAR
        { $$ = $1; }
    | INVALID
        { 
          params_obj.errors.push({
            type: 'lexical',
            message: 'Invalid character: ' + yytext,
            location: @1
          });
          $$ = '';
        }
    ;