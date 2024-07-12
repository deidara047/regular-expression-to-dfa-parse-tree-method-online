"use client"

import Image from "next/image";
import styles from "./page.module.css";
import { ChangeEvent, useState } from "react";
import { DataFollowListTuple } from "./api/_classes/DataFollowListTuple";
import FollowPosTable from "./_components/FollowPosTable";
import { TransitionsTableData } from "./api/_classes/TransitionsTableData";
import TransitionsTable from "./_components/TransitionsTable";
import { LinkedList } from "./api/_structs/LinkedList";
import { ResStruct } from "./typestouse";

export default function Home() {
  const [inputValue, setInputValue] = useState('ab?c(a|b)+');
  const [dotSyntacticTree, setdotSyntacticTree] = useState("");
  const [followPosTableContent, setFollowPosTableContent] = useState<DataFollowListTuple[] | null>(null);
  const [dotDFA, setdotDFA] = useState("");
  const [transitionsTableProps, setTransitionsTableProps] = useState<{
    transitionsTable: TransitionsTableData[];
    alphabetList: string[];
  } | null>(null);

  async function analyzeRegExp() {
    const response = await fetch('http://localhost:3000/api',
      {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ input: inputValue })
      });

    const result: ResStruct = await response.json();

    setdotSyntacticTree(result.svgSyntacticTree);
    setFollowPosTableContent(result.followPosTableContent.map((elem) => {
      let newDT = new DataFollowListTuple(elem._data);
      newDT.followList.addAll(elem._followList);
      return newDT;
    }));
    setTransitionsTableProps({
      transitionsTable: result.transitionsTableContent.map((elem) => {
        let newTTD = new TransitionsTableData(0, new LinkedList<number>, elem._isEndingState);
        newTTD.nextStateBySymbolArray.push(...elem._nextStateBySymbolArray);
        newTTD.arrLeaves.addAll(elem._arrLeaves);
        return newTTD;
      }),
      alphabetList: result.alphabetList
    });

    setdotDFA(result.svgDFAGraph);
  }

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  return (
    <main className={styles.all + " container"}>
      <h1>Regular Expresion to DFA</h1>
      <h2>Parse tree method</h2>

      <div>
        <label className="col-form-label mt-4" htmlFor="inputDefault">Enter the Regular Expresion</label>
        <input value={inputValue}
          onChange={handleChange}
          type="text"
          className="form-control"
          placeholder="Default input"
          id="inputDefault" />
        <button onClick={() => analyzeRegExp()} className='btn btn-light'>Generate DFA</button>
      </div>

      <div dangerouslySetInnerHTML={{ __html: dotSyntacticTree }} style={{ width: 750, border: "1px solid black" }}>
      </div>

      <div>
        {followPosTableContent != null ? <FollowPosTable followPosTable={followPosTableContent} /> : ""}
      </div>

      <div className='mt-2'>
        {transitionsTableProps != null ? <TransitionsTable 
                                            transitionsTable={transitionsTableProps.transitionsTable} 
                                            alphabetList={transitionsTableProps.alphabetList} 
                                          /> : ""}
      </div>

      <div>
        <h2>DFA Graph</h2>
      </div>
      <div dangerouslySetInnerHTML={{ __html: dotDFA }} style={{ width: 750, border: "1px solid black" }}>
      </div>
    </main>
  );
}
