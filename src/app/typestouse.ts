import { DataFollowListTuple } from "./api/_classes/DataFollowListTuple";
import { TransitionsTableData } from "./api/_classes/TransitionsTableData";

export interface ResStruct {
  svgSyntacticTree: string;
  svgDFAGraph: string;
  followPosTableContent: DataFollowListTuple[];
  transitionsTableContent: TransitionsTableData[];
  alphabetList: string[];
}