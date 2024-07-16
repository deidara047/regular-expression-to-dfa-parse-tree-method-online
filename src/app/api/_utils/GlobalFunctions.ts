import { DataFollowListTuple } from "../_classes/DataFollowListTuple";
import { Node } from "../_classes/Node";
import { SyntacticTree } from "../_classes/SyntacticTree";
import { TransitionsTableData } from "../_classes/TransitionsTableData";
import { LinkedList } from "../_structs/LinkedList";

export function generateTransitionsTableData(alphabetList: string[], rootNode: Node, followPosTable: DataFollowListTuple[]): TransitionsTableData[] {
  let transitionsTable: TransitionsTableData[] = [];

  // Insert first data which is firstPosList from rootNode
  transitionsTable.push(new TransitionsTableData(alphabetList.length, rootNode.firstPosList, rootNode.firstPosList.contains(rootNode.rightNode!.count)));

  let rowTransitionTableCounter: number = 0;
  while (true) {
    let isNewElement: boolean = false;

    for (let i = 0; i < alphabetList.length; i++) {
      let elem = alphabetList[i];

      let leavesWithTransition: LinkedList<number> = new LinkedList<number>();

      for (let j = 0; j < transitionsTable[rowTransitionTableCounter].arrLeaves.size(); j++) {
        const leaf = transitionsTable[rowTransitionTableCounter].arrLeaves.get(j);

        if (rootNode.rightNode!.count == leaf!) {
          break;
        }

        if (followPosTable[(leaf! - 1)].data === elem) {
          leavesWithTransition.append((leaf! - 1));
        }
      }

      if (!leavesWithTransition.isEmpty()) {
        // Generate the new state merging their followList leaves
        let newState: LinkedList<number> = new LinkedList<number>();

        for (let j = 0; j < leavesWithTransition.size(); j++) {
          const leaf = leavesWithTransition.get(j);

          newState.addAll(followPosTable[leaf!].followList);
        }

        newState.sort();

        newState.removeDuplicates();

        // Get the new state and check if exists or not. Then bind it to the 'from' state
        let stateAlreadyExists = false;

        for (let j = 0; j < transitionsTable.length; j++) {
          const elem = transitionsTable[j];

          if (arraysAreEqual(elem.arrLeaves.toArray(), newState.toArray())) {
            stateAlreadyExists = true;
            transitionsTable[rowTransitionTableCounter].nextStateBySymbolArray[i] = j;
            break;
          }
        }

        if (!stateAlreadyExists) {
          transitionsTable[rowTransitionTableCounter].nextStateBySymbolArray[i] = transitionsTable.length;
          let isEndingState = newState.contains(rootNode.rightNode!.count);
          transitionsTable[transitionsTable.length] = new TransitionsTableData(alphabetList.length, newState, isEndingState);
          isNewElement = true;
        }
      }
    }

    if (!isNewElement && ((transitionsTable.length - 1) == rowTransitionTableCounter)) {
      break;
    }

    rowTransitionTableCounter++;
  }

  return transitionsTable;
}

export function generateDFADot(alphabetList: string[], transitionsTable: TransitionsTableData[]): string {
  let dot = "digraph finite_state_machine {\n";
  dot += "    rankdir=LR;\n";
  dot += "    node [shape = doublecircle]; ";

  // Add ending states
  transitionsTable.forEach((data, index) => {
    if (data.isEndingState) {
      dot += `S${index} `;
    }
  });
  dot += ";\n";

  dot += "    node [shape = circle];\n";

  // Map to store combined transitions
  const combinedTransitions: Map<string, string[]> = new Map();

  // Combine transitions
  transitionsTable.forEach((data, fromState) => {
    data.nextStateBySymbolArray.forEach((toState, symbolIndex) => {
      if (toState !== null) {
        const symbol = alphabetList[symbolIndex];
        const key = `S${fromState}->S${toState}`;
        
        if (!combinedTransitions.has(key)) {
          combinedTransitions.set(key, []);
        }
        combinedTransitions.get(key)!.push(symbol);
      }
    });
  });

  // Add combined transitions to dot
  combinedTransitions.forEach((symbols, transition) => {
    const [fromState, toState] = transition.split('->');
    dot += `    ${fromState} -> ${toState} [label="${symbols.join('|')}"];\n`;
  });

  dot += "}";
  return dot;
}

export function generateSyntacticTreeDot(tree: SyntacticTree): string {
  let dotString = 'digraph BST {\n';
  dotString += '  node[shape=plaintext]\n\n'
  let nodeCounter = 1;

  function traverse(node: Node | null, parentId: number | null = null): void {
    if (node === null) return;

    const currentId = nodeCounter++;
    dotString += `  node${currentId}  [label=<\n`
               + "                <TABLE BORDER=\"1\" STYLE=\"rounded\""
               + (node.count == 0 && (!node.firstPosList.isEmpty()) ? " BGCOLOR=\"#e0e6eb\" COLOR=\"#555555\"" : " COLOR=\"#777777\"")
               + ">\n"
               + "                  <TR>\n"
               + "                    <TD BORDER=\"0\"></TD>\n"
               + "                    <TD BORDER=\"0\">"
               + (node.isNullable ? "V" : "F") // NULLABILITY
               + "</TD>\n"
               + "                    <TD BORDER=\"0\"></TD>\n"
               + "                  </TR>\n"
               + "                  <TR>\n"
               + "                    <TD BORDER=\"0\">"
               + "<FONT COLOR=\"#e74c3c\">"
               + (node.firstPosList.isEmpty() ? "  " : node.firstPosList.toString()) // FIRSTPOSLIST
               + "</FONT>"
               + "</TD>\n"
               + "                    <TD COLOR=\"#black\" BGCOLOR=\"#f5f5dc\" BORDER=\"1\" STYLE=\"rounded\">  "
               + node.data // DATA
               + "</TD>\n"
               + "                    <TD BORDER=\"0\" STYLE=\"rounded\">"
               + "<FONT COLOR=\"#0652DD\">"
               + (node.lastPosList.isEmpty() ? "  " : node.lastPosList.toString()) // LASTPOSLIST
               + "</FONT>"
               + "</TD>\n"
               + "                  </TR>\n"
               + (node.count > 0 ? (""
                  + "                  <TR>\n"
                  + "                    <TD BORDER=\"0\"></TD>\n"
                  + "                    <TD SIDES=\"T\"><B>" + node.count + "</B></TD>\n"
                  + "                    <TD BORDER=\"0\"></TD>\n"
                  + "                  </TR>\n") : "\n") // COUNT
              + "                </TABLE>>];\n\n";
; 
    //dotString += `    node${currentId} [label="${node.data}${node.count > 0 ? ":" + node.count : ""}|${node.isNullable}:${node.firstPosList.toString()}|${node.lastPosList.toString()}"];\n`;

    if (parentId !== null) {
      dotString += `    node${parentId} -> node${currentId};\n`;
    }

    traverse(node.leftNode, currentId);
    traverse(node.rightNode, currentId);
  }

  traverse(tree.root);
  dotString += '}';
  return dotString;
}


function arraysAreEqual(arr1: number[], arr2: number[]): boolean {
  if (arr1.length !== arr2.length) {
    return false;
  }

  // Copy and sort both arrays
  let sortedArr1 = [...arr1].sort((a, b) => a - b);
  let sortedArr2 = [...arr2].sort((a, b) => a - b);

  // Compare the elements one by one
  for (let i = 0; i < sortedArr1.length; i++) {
    if (sortedArr1[i] !== sortedArr2[i]) {
      return false;
    }
  }

  return true;
}