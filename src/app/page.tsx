"use client"

import styles from "./page.module.css";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { DataFollowListTuple } from "./api/_classes/DataFollowListTuple";
import FollowPosTable from "./_components/FollowPosTable";
import { TransitionsTableData } from "./api/_classes/TransitionsTableData";
import TransitionsTable from "./_components/TransitionsTable";
import { LinkedList } from "./api/_structs/LinkedList";
import { ResStruct } from "./typestouse";
import 'katex/dist/katex.min.css';
import Latex from 'react-latex-next';
import Spinner from 'react-bootstrap/Spinner';
import Link from "next/link";
import { config } from '@fortawesome/fontawesome-svg-core'
import '@fortawesome/fontawesome-svg-core/styles.css'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub } from "@fortawesome/free-brands-svg-icons";
import { TsCalcParser } from "./api/_analyzer/ts-analyzer2";
import Swal from "sweetalert2"
config.autoAddCss = false;

interface FormData {
  inputValue: string;
  checkbox1: boolean;
  checkbox2: boolean;
}

interface ErrorStruct {
  type: string;
  message: string;
  line: string;
}

export default function Home() {
  const [isLoading, setisLoading] = useState(false);
  const [error, seterror] = useState<ErrorStruct>({ type: "", message: "", line: "" });
  const [finalRegExp, setfinalRegExp] = useState("");
  const [formData, setFormData] = useState<FormData>({
    inputValue: '',
    checkbox1: false,
    checkbox2: false,
  });

  const [dotSyntacticTree, setdotSyntacticTree] = useState("");
  const [followPosTableContent, setFollowPosTableContent] = useState<DataFollowListTuple[] | null>(null);
  const [dotDFA, setdotDFA] = useState("");
  const [transitionsTableProps, setTransitionsTableProps] = useState<{
    transitionsTable: TransitionsTableData[];
    alphabetList: string[];
  } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: (type === 'checkbox' ? checked : value),
    }));

    if (error.message.length > 0) {
      seterror(prevData => ({
        ...prevData,
        message: "",
        line: ""
      }))
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    let result1 = null;
    let localErrors: any[] = []

    try {
      let prsInstance = new TsCalcParser();
      result1 = prsInstance.parse(formData.inputValue, {
        errors: localErrors,
        checkbox1: formData.checkbox1,
        checkbox2: formData.checkbox2
      });
    } catch (e: any) {
      console.error(e);
    }

    if (localErrors.length > 0) {
      seterror({ type: localErrors[0].type, message: localErrors[0].message, line: localErrors[0].location.first_column })
    } else {
      setisLoading(true);
      try {
        setfinalRegExp(result1);
        const response = await fetch('https://regular-expression-to-dfa-parse-tree-method-online.vercel.app/api',
          {
            method: "POST",
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ input: result1 })
          });


        const result: ResStruct = await response.json();
        console.log(result)

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
      } catch (e) {
        if (e instanceof Error) {
          console.log(e.message)
          Swal.fire("ERROR", "ERROR 500: " + e.message, "error")
        }
      } finally {
        setisLoading(false);
      }

    }
    /*
    seterrors(prevErrors => [...prevErrors, {
      type: 'fatal',
      message: localErrors[0].message,j
    }])
      */
  };


  return (
    <main className={styles.all}>

      <div className={styles.content + " container border border-secondary"}>
        <h1 style={{ textShadow: "0.1rem 0.1rem #aaa" }}><b>Regular Expresion to DFA Online</b></h1>
        <h3>Parse tree method</h3>
        <Link target="_blank" className="text-decoration-none" href="https://github.com/deidara047/regular-expression-to-dfa-parse-tree-method-online"><FontAwesomeIcon icon={faGithub} /> by Deidr047</Link>
        <div className="card mt-3" style={{ backgroundColor: "#eee" }}>
          <div className="card-body">
            <div>
              <h6 className="fw-bold card-subtitle mb-2" style={{ color: "#0c2461" }}>Write epsilon</h6>
              <p className="card-text">To write epsilon, you can type <b>""</b>, <b>''</b>, <Latex>{`$\\epsilon$`}</Latex> or <Latex>{`$ε$`}</Latex>.</p>
            </div>
            <div className="mt-4">
              <h6 className="fw-bold card-subtitle mb-2" style={{ color: "#0c2461" }}>Supported grammars:</h6>
              <ul>
                <li><Latex>{"$(a)$"}</Latex></li>
                <li><Latex>{"$ab$"}</Latex></li>
                <li><Latex>{"$a|b$"}</Latex></li>
                <li><Latex>{"$a*$"}</Latex></li>
                <li><Latex>{"$a+$"}</Latex></li>
                <li><Latex>{"$a?$"}</Latex></li>
                <li><Latex>{"$\\varepsilon$"}</Latex> (epsilon character)</li>
              </ul>
            </div>
            <div className="mt-4">
              <h6 className="fw-bold card-subtitle mb-2" style={{ color: "#0c2461" }}>Valid examples:</h6>
              <ul>
                <li><Latex>{"$ab?c(a|b)+$"}</Latex></li>
                <li><Latex>{"$(0|1)+$"}</Latex></li>
                <li><Latex>{"$(d|b|c|a|ε)(d|b)d*$"}</Latex></li>
                <li><Latex>{"$((0|1)+|(a|b)+)*(iloveyou)?$"}</Latex></li>
              </ul>
            </div>
            <div className="mt-4">
              <h6 className="fw-bold card-subtitle mb-2" style={{ color: "#0c2461" }}>How this works? And the rules of the method:</h6>
              <p className="mb-1">
                If you have questions about the rules of this method, please visit this GeeksForGeeks webpage (GeeksForGeeks you are the best :D):
              </p>
              <Link target="_blank" href="https://www.geeksforgeeks.org/regular-expression-to-dfa/">https://www.geeksforgeeks.org/regular-expression-to-dfa/</Link>
              <p className="mt-2">If you need further information about how this application works, <Link target="_blank" href="https://github.com/deidara047/regular-expression-to-dfa-parse-tree-method-online">go to this site.</Link></p>
            </div>
          </div>
        </div>

        <hr />
        <form onSubmit={handleSubmit}>
          <div>
            <label className="col-form-label" htmlFor="input-text">Enter the Regular Expresion</label>
            <input
              value={formData.inputValue}
              name="inputValue"
              onChange={handleChange}
              type="text"
              className={styles.input_text + " form-control " + (error.message.length > 0 ? "is-invalid" : "")}
              placeholder="Example: (a*|b*)*"
              required={true}
              id="input-text" />
            {error.message.length > 0 && <div className="invalid-feedback">{error.message}. at character {error.type === "syntax" ? Number(error.line) : Number(error.line) + 1}</div>}

          </div>
          <fieldset className="mt-3 mb-2">
            <div className="form-check">
              <input
                className="form-check-input"
                name="checkbox1"
                type="checkbox"
                checked={formData.checkbox1}
                onChange={handleChange}
                id="flexCheck1"
              />
              <label className="form-check-label" htmlFor="flexCheck1">
                Use <Latex>{`$a?$`}</Latex> as <Latex>{`$\\relax(a|\\varepsilon)$`}</Latex>
              </label>
            </div>
            <div className="form-check">
              <input
                className="form-check-input"
                name="checkbox2"
                type="checkbox"
                checked={formData.checkbox2}
                onChange={handleChange}
                id="flexCheck2"
              />
              <label className="form-check-label" htmlFor="flexCheck2">
                Use <Latex>{`$a+$`}</Latex> as <Latex>{`$aa*$`}</Latex>
              </label>
            </div>
          </fieldset>
          <button type="submit" disabled={isLoading} className='btn btn-primary mt-2'>Generate DFA</button>
        </form>

        {isLoading ? <div className="d-flex mt-3 justify-content-center">
          <Spinner animation="border" variant="primary" />
        </div> : dotDFA.length > 0 ? <div>
          <hr />
          <p className="text-muted">Result of <Latex>{`$${finalRegExp}$`}</Latex>:</p>

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
