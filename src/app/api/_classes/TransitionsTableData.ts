import { LinkedList } from "../_structs/LinkedList";

class TransitionsTableData {
  private _arrLeaves: LinkedList<number>;
  private _nextStateBySymbolArray: (number | null)[];
  private _isEndingState: boolean;

  constructor(lengthArr: number, arrLeaves: LinkedList<number>, isEndingState: boolean) {
    let newArr: (number | null)[] = [];
    
    for (let i = 0; i < lengthArr; i++) {
      newArr.push(null);
    }

    this._arrLeaves = arrLeaves;
    this._nextStateBySymbolArray = newArr;
    this._isEndingState = isEndingState;
  }

  get arrLeaves(): LinkedList<number> {
    return this._arrLeaves;
  }

  get nextStateBySymbolArray(): (number | null)[] {
    return this._nextStateBySymbolArray;
  }

  get isEndingState(): boolean {
    return this._isEndingState;
  }

  set isEndingState(data: boolean) {
    this._isEndingState = data;
  }
}

export { TransitionsTableData }