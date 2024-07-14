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
import 'katex/dist/katex.min.css';
import Latex from 'react-latex-next';
import SSRProvider from 'react-bootstrap/SSRProvider';
import Spinner from 'react-bootstrap/Spinner';
import Link from "next/link";
import { config } from '@fortawesome/fontawesome-svg-core'
import '@fortawesome/fontawesome-svg-core/styles.css'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub } from "@fortawesome/free-brands-svg-icons";
config.autoAddCss = false;

export default function Home() {
  const [isLoading, setisLoading] = useState(false);
  const [inputValue, setInputValue] = useState('ab?c(a|b)+');
  const [inputValue2, setInputValue2] = useState('');
  const [dotSyntacticTree, setdotSyntacticTree] = useState("");
  const [followPosTableContent, setFollowPosTableContent] = useState<DataFollowListTuple[] | null>(null);
  const [dotDFA, setdotDFA] = useState("");
  const [transitionsTableProps, setTransitionsTableProps] = useState<{
    transitionsTable: TransitionsTableData[];
    alphabetList: string[];
  } | null>(null);

  async function analyzeRegExp() {
    setisLoading(true);
    const response = await fetch('http://localhost:3000/api',
      {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ input: inputValue })
      });

    const result: ResStruct = await response.json();

    setisLoading(false);

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
    <main className={styles.all}>
      <div className={styles.content + " container border border-secondary"}>
        <h1 style={{ textShadow: "2px 2px #aaa" }}><b>Regular Expresion to DFA Online</b></h1>
        <h3>Parse tree method</h3>
        <Link target="_blank" className="text-decoration-none" href="https://www.geeksforgeeks.org/regular-expression-to-dfa/"><FontAwesomeIcon icon={faGithub} /> by Deidr047</Link>
        <div className="card mt-3" style={{ backgroundColor: "#eee" }}>
          <div className="card-body">
            <div>
              <h6 className="fw-bold card-subtitle mb-2" style={{ color: "#0c2461" }}>Write epsilon</h6>
              <p className="card-text">To write epsilon, you can type <b>''</b>, <Latex>{`$\\epsilon$`}</Latex> or <Latex>{`$\\varepsilon$`}</Latex>.</p>
            </div>
            <div className="my-4">
              <h6 className="fw-bold card-subtitle mb-2" style={{ color: "#0c2461" }}>Valid characters</h6>
              <ul className="">
                <li className="">All letters of the english alphabet, whether uppercase or lowercase. i.e. <b>a</b>,<b>B</b>,<b>Z</b>,<b>e</b></li>
                <li className="">Integer numbers. i.e. <b>1</b>,<b>2</b>,<b>3</b></li>
                <li className="">
                  These others: <b>!</b>,
                  <b> %</b>,
                  <b> &</b>,
                  <b> /</b>,
                  <b> =</b>,
                  <b> ?</b>,
                  <b> ¿</b>,
                  <b> ¡</b>,
                  <b> -</b>,
                  <b> _</b>,
                  <b> .</b>,
                  <b> ,</b>,
                  <b> _</b>,
                  <b> ;</b>,
                  <b> &lt;</b>,
                  <b> &gt;</b>
                </li>
              </ul>
              <p>Of course, if you cannot use a certain character, you can always replace it with a valid one.</p>
            </div>
            <div>
              <h6 className="fw-bold card-subtitle mb-2" style={{ color: "#0c2461" }}>How this works? And the rules of the method:</h6>
              <p className="mb-1">
                If you have questions about the rules of this method, please visit this GeeksForGeeks webpage (GeeksForGeeks you are the best :D):
              </p>
              <Link target="_blank" href="https://www.geeksforgeeks.org/regular-expression-to-dfa/">https://www.geeksforgeeks.org/regular-expression-to-dfa/</Link>
            </div>
          </div>
        </div>

        <hr />
        <div>
          <label className="col-form-label" htmlFor="input-text">Enter the Regular Expresion</label>
          <input value={inputValue}
            onChange={handleChange}
            type="text"
            className={styles.input_text + " form-control"}
            placeholder="Default input"
            id="input-text" />
        </div>
        <fieldset className="mt-3 mb-2">
          <div className="form-check">
            <input className="form-check-input" type="checkbox" value="" id="flexCheck1" />
            <label className="form-check-label" htmlFor="flexCheck1">
              Use <Latex>{`$a?$`}</Latex> as <Latex>{`$\\relax(a|\\varepsilon)$`}</Latex>
            </label>
          </div>
          <div className="form-check">
            <input className="form-check-input" type="checkbox" value="" id="flexCheck2" />
            <label className="form-check-label" htmlFor="flexCheck2">
              Use <Latex>{`$a+$`}</Latex> as <Latex>{`$aa*$`}</Latex>
            </label>
          </div>
        </fieldset>
        <button onClick={() => analyzeRegExp()} disabled={isLoading} className='btn btn-primary mt-2'>Generate DFA</button>

        {isLoading ? <div className="d-flex mt-3 justify-content-center">
          <Spinner animation="border" variant="primary" />
        </div> : dotDFA.length > 0 ? <div>
          <hr />
          <p className="text-muted">Result:</p>

          <div className="mt-3">
            <div>
              <h2>Parse Tree Graph</h2>
            </div>

            <div className="overflow-auto" dangerouslySetInnerHTML={{ __html: dotSyntacticTree }}>
            </div>

            {followPosTableContent != null ? <div className="mt-5 overflow-auto"><FollowPosTable followPosTable={followPosTableContent} /></div> : ""}

            {transitionsTableProps != null ? <div className='mt-5 overflow-auto'><TransitionsTable
              transitionsTable={transitionsTableProps.transitionsTable}
              alphabetList={transitionsTableProps.alphabetList}
            />  </div> : ""}

            {dotDFA.length > 0 ? <div className="mt-5">
              <h2>DFA Graph</h2>
              <p><b>Initial State: </b> S0</p>
              <div className="overflow-auto" dangerouslySetInnerHTML={{ __html: dotDFA }}>
              </div>
            </div> : ""}
          </div>
        </div> : ""}
      </div>
    </main>
  );
}
