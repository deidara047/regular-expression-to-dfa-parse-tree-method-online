import { TsCalcParser as  TsCalcParser1 } from "./_analyzer/ts-analyzer";
import { TsCalcParser as  TsCalcParser2 } from "./_analyzer/ts-analyzer2";
import { DataFollowListTuple } from "./_classes/DataFollowListTuple";
import { SyntacticTree } from "./_classes/SyntacticTree";
import { Node } from "./_classes/Node";
import { generateDFADot, generateSyntacticTreeDot, generateTransitionsTableData } from "./_utils/GlobalFunctions";
import { TransitionsTableData } from "./_classes/TransitionsTableData";
import { ResStruct } from "../typestouse";
import { instance, RenderOptions } from '@viz-js/viz';

interface ReqStruct {
  input: string
}

interface Location {
  first_line: number;
  last_line: number;
  first_column: number;
  last_column: number;
}

type ErrorType = 'lexical' | 'syntax' | 'fatal';

interface ParserError {
  type: ErrorType;
  message: string;
  location?: Location;
}

interface ParserResult {
  rootNode: Node;
  followPosTable: DataFollowListTuple[];
  alphabetList: string[];
}

export async function POST(req: Request) {
  const reqBody: ReqStruct = await req.json();

  const errors: ParserError[] = [];
  let result: ParserResult | null = null;
  try {
    let prsInstance = new TsCalcParser1();
    result = prsInstance.parse(reqBody.input, errors);
  } catch (e: any) {
    errors.push({
      type: 'fatal',
      message: e.message,
      location: e.hash ? e.hash.loc : undefined
    });
  }

  const tree = new SyntacticTree(result!.rootNode);

  let transitionsTable: TransitionsTableData[] = generateTransitionsTableData(result!.alphabetList, result!.rootNode, result!.followPosTable);

  async function generateSyntacticTreeSvg() {
    const viz = await instance();
    
    const dotSource = generateSyntacticTreeDot(tree);
    const options: RenderOptions = { engine: 'dot', format: 'svg' };
    
    const svgString = viz.renderString(dotSource, options);

    return svgString;
  }

  async function generateDFASvg() {
    const viz = await instance();
    
    const dotSource = generateDFADot(result!.alphabetList, transitionsTable);
    const options: RenderOptions = { engine: 'dot', format: 'svg' };
    
    const svgString = viz.renderString(dotSource, options);

    return svgString;
  }

  const results: [string, string] = await Promise.all([generateSyntacticTreeSvg(), generateDFASvg()]);

  const resJson: ResStruct = { 
    svgSyntacticTree: results[0] ,
    followPosTableContent: result!.followPosTable,
    transitionsTableContent: transitionsTable,
    alphabetList: result!.alphabetList,
    svgDFAGraph: results[1]
  }
  return Response.json(resJson);
}