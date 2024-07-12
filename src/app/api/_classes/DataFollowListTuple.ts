import { LinkedList } from "../_structs/LinkedList";

class DataFollowListTuple {
  private _data: string;
  private _followList: LinkedList<number>;

  constructor(data: string) {
    this._data = data;
    this._followList = new LinkedList<number>();
  }

  get followList(): LinkedList<number> {
    return this._followList;
  }

  get data(): string {
    return this._data;
  }

  set data(data: string) {
    this._data = data;
  }

  getLL() {
    return this._followList;
  }
}

export { DataFollowListTuple }