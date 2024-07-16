
/* description: Parses and executes mathematical expressions. */
%{
import { Node } from '../_classes/Node';
import { LinkedList } from '../_structs/LinkedList';
import { DataFollowListTuple } from '../_classes/DataFollowListTuple';

function hexlify (str:string): string {
  return str.split('')
    .map(ch => '0x' + ch.charCodeAt(0).toString(16))
    .join(', ')
}

// To reset
let nodeCounter = 0;

function getNodeCounter(): number {
    nodeCounter++;
    return nodeCounter;
}

let followPosTable: DataFollowListTuple[] = [];
let alphabetList: string[] = [];

function insertInFollowPosTable(keys: LinkedList<number>, elemsForEachKey: LinkedList<number>) {
    for (let i = 0; i < keys.size(); i++) {
        for (let j = 0; j < elemsForEachKey.size(); j++) {
            if(!followPosTable[keys.get(i)! - 1].followList.contains(elemsForEachKey.get(j)!)) {
                followPosTable[keys.get(i)! - 1].followList.appendSorted(elemsForEachKey.get(j)!);
            }
        }
    }
}

function insertInAlphabetList(elem: string) {
    if (!alphabetList.includes(elem)) {
        alphabetList.push(elem);
    }
}

%}
/* εϵ */
/* lexical grammar */
%lex
%verbose999           // change to 'verbose' to see lexer decisions
%no-break-if          (.*[^a-z] | '') 'return' ([^a-z].* | '') // elide trailing 'break;'

%%

\s+                         if (yy.trace) yy.trace(`skipping whitespace ${hexlify(yytext)}`)
"*"|"∗"                     return '*'
"+"                         return '+'
"|"|"∣"                     return '|'
"?"                         return '?'
"("                         return '('
")"                         return ')'
"ε"|"ϵ"                     return 'EPSILON'
[^?\+\*\(\)"|""∣""'"\"\\\n\r\t] return 'CHAR'
<<EOF>>                     return 'EOF'
.                           return 'INVALID'

/lex



%start expressions

%parse-param errors

%% /* language grammar */

expressions
    : expr EOF
        {   let thorpeNode = new Node("#", false, getNodeCounter());
            let rootNode = new Node(".", $1.isNullable && false);
            thorpeNode.firstPosList.append(thorpeNode.count);
            thorpeNode.lastPosList.append(thorpeNode.count);

            rootNode.leftNode = $1;
            rootNode.rightNode = thorpeNode;

            // First pos list
            if(rootNode.leftNode!.isNullable === true) {
                let newList = rootNode.leftNode!.firstPosList.clone();
                newList.addAll(rootNode.rightNode.firstPosList);

                rootNode.firstPosList.addAll(newList);
            } else {
                rootNode.firstPosList.addAll(rootNode.leftNode!.firstPosList);
            }

            // Last pos list
            if(rootNode.rightNode.isNullable === true) {
                let newList = rootNode.leftNode!.lastPosList.clone();
                newList.addAll(rootNode.rightNode.lastPosList);

                rootNode.lastPosList.addAll(newList);
            } else {
                rootNode.lastPosList.addAll(rootNode.rightNode.lastPosList);
            }

            // Insert in followPosTable
            insertInFollowPosTable(
                rootNode.leftNode!.lastPosList,
                rootNode.rightNode.firstPosList
            );


            let trueResponse = { rootNode, followPosTable: [...followPosTable], alphabetList: [...alphabetList] }
            
            nodeCounter = 0;
            followPosTable = [];
            alphabetList = [];
            return trueResponse; 
        }
    | error EOF
        {
          errors.push({
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
        { 
            $$ = new Node("|", $1.isNullable || $3.isNullable); 
            $$.leftNode = $1; 
            $$.rightNode = $3; 

            // First pos list
            let newList = $$.leftNode.firstPosList.clone();
            newList.addAll($$.rightNode.firstPosList);
            $$.firstPosList.addAll(newList);

            // Last pos list
            let newList2 = $$.leftNode.lastPosList.clone();
            newList2.addAll($$.rightNode.lastPosList);
            $$.lastPosList.addAll(newList2);
        }
    ;

term
    : factor
        { $$ = $1; }
    | term factor
        { 
            $$ = new Node(".", $1.isNullable && $2.isNullable); 
            $$.leftNode = $1; 
            $$.rightNode = $2;

            // First pos list
            if($$.leftNode.isNullable === true) {
                let newList = $$.leftNode.firstPosList.clone();
                newList.addAll($$.rightNode.firstPosList);

                $$.firstPosList.addAll(newList);
            } else {
                $$.firstPosList.addAll($$.leftNode.firstPosList);
            }

            // Last pos list
            if($$.rightNode.isNullable === true) {
                let newList = $$.leftNode.lastPosList.clone();
                newList.addAll($$.rightNode.lastPosList);

                $$.lastPosList.addAll(newList);
            } else {
                $$.lastPosList.addAll($$.rightNode.lastPosList);
            }

            // Insert in followPosTable
            insertInFollowPosTable(
                $$.leftNode.lastPosList,
                $$.rightNode.firstPosList
            );
        }
    ;

factor
    : base
        { $$ = $1; }
    | base '*'
        { 
            $$ = new Node("*", true); 
            $$.leftNode = $1; 
            $$.firstPosList.addAll($1.firstPosList);
            $$.lastPosList.addAll($1.lastPosList);

            insertInFollowPosTable(
                $$.lastPosList,
                $$.firstPosList
            );
        }
    | base '+'
        { 
            $$ = new Node("+", false); 
            $$.leftNode = $1; 
            $$.firstPosList.addAll($1.firstPosList);
            $$.lastPosList.addAll($1.lastPosList);

            insertInFollowPosTable(
                $$.lastPosList,
                $$.firstPosList
            );
        }
    | base '?'
        { 
            $$ = new Node("?", true); 
            $$.leftNode = $1;
            $$.firstPosList.addAll($1.firstPosList);
            $$.lastPosList.addAll($1.lastPosList);
        }
    ;

base
    : '(' expr ')'
        { $$ = $2; }
    | EPSILON
        {
            $$ = new Node($1, true);
        }
    | CHAR
        { 
            $$ = new Node($1, false, getNodeCounter());
            $$.firstPosList.append($$.count);
            $$.lastPosList.append($$.count);
            followPosTable.push(new DataFollowListTuple($1));
            insertInAlphabetList($1);
        } 
    | INVALID
        { 
          errors.push({
            type: 'lexical',
            message: 'Invalid character: ' + yytext,
            location: @1
          });
          $$ = '';
        }
    ;
    