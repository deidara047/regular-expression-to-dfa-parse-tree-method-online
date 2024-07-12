import { TsCalcParser } from "./_analyzer/ts-analyzer";
import { DataFollowListTuple } from "./_classes/DataFollowListTuple";
import { SyntacticTree } from "./_classes/SyntacticTree";
import { Node } from "./_classes/Node";
import { toStream } from "ts-graphviz/adapter";
import { generateDFADot, generateSyntacticTreeDot, generateTransitionsTableData } from "./_utils/GlobalFunctions";
import { TransitionsTableData } from "./_classes/TransitionsTableData";
import { ResStruct } from "../typestouse";

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
    let prsInstance = new TsCalcParser();
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
    const stream = await toStream(generateSyntacticTreeDot(tree), { format: 'svg' });
    const chunks: Buffer[] = [];

    for await (const chunk of stream) {
      chunks.push(Buffer.from(chunk));
    }

    const svgString = Buffer.concat(chunks).toString('utf-8');
    return svgString;
  }

  async function generateDFASvg() {
    const stream = await toStream(generateDFADot(result!.alphabetList, transitionsTable), { format: 'svg' });
    const chunks: Buffer[] = [];

    for await (const chunk of stream) {
      chunks.push(Buffer.from(chunk));
    }

    const svgString = Buffer.concat(chunks).toString('utf-8');
    return svgString;
  }

  const results: [string, string] = await Promise.all([generateSyntacticTreeSvg(), generateDFASvg()]);

  //return { result, errors };

  const resJson: ResStruct = { 
    svgSyntacticTree: results[0] ,
    followPosTableContent: result!.followPosTable,
    transitionsTableContent: transitionsTable,
    alphabetList: result!.alphabetList,
    svgDFAGraph: results[1]
  }
  return Response.json(resJson);
}