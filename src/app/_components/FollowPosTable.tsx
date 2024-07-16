import { DataFollowListTuple } from "../api/_classes/DataFollowListTuple";

interface Props {
  followPosTable: DataFollowListTuple[]
}

const FollowPosTable: React.FC<Props> = ({ followPosTable }) => {
  return (
    <div>
      <h2>Follow Pos Table</h2>
      <table className="table table-striped w-auto table-bordered" style={{ tableLayout: "auto" }}>
        <thead>
          <tr>
            <th scope="col" className="text-center">Leaf</th>
            <th scope="col" className="text-center">Symbol</th>
            <th scope="col" className="text-center">Follow Pos</th>
          </tr>
        </thead>
        <tbody>
          {followPosTable.map((item, index) => (
            <tr key={index}>
              <th scope="row" className="text-end">{index + 1}</th>
              <td className="text-center">{item.data}</td>
              <td>{item.followList.toString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default FollowPosTable;