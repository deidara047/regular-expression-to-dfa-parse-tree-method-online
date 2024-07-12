import { TransitionsTableData } from "../api/_classes/TransitionsTableData";

interface Props {
  transitionsTable: TransitionsTableData[];
  alphabetList: string[];
}

const TransitionsTable: React.FC<Props> = ({ transitionsTable, alphabetList }) => {
  return (
    <div>
      <h2>Transitions Table</h2>
      <table className="table table-striped">
        <thead>
          <tr>
            <th scope="col">States</th>
            {alphabetList.map((item, index) => <th key={index} scope="col">{item}</th>)}
          </tr>
        </thead>
        <tbody>
          {transitionsTable.map((item, index) => (
            <tr key={index}>
              <th scope="row">{(item.isEndingState ? "*" : "") + "S" + index} = {"{" + item.arrLeaves.toString() + "}"}</th>
              {item.nextStateBySymbolArray.map((item2, index) => <td key={index}>{item2 != null ? ("S" + item2) : "-"}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TransitionsTable;