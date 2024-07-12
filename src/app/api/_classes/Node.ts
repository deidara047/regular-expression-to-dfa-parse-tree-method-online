import { LinkedList } from "../_structs/LinkedList";

class Node {
  private _data: string;
  private _count: number;
  private _leftNode: Node | null;
  private _rightNode: Node | null;
  private _isNullable: boolean;
  private _firstPosList: LinkedList<number>;
  private _lastPosList: LinkedList<number>;

  constructor(data: string, isNullable: boolean, count: number | null = null) {
    this._data = data;
    this._leftNode = null;
    this._rightNode = null;
    this._isNullable = isNullable;
    this._firstPosList = new LinkedList<number>();
    this._lastPosList = new LinkedList<number>();

    if(count != null) {
      this._count = count;
    } else {
      this._count = 0;
    }
  }

  get firstPosList(): LinkedList<number> {
    return this._firstPosList;
  }

  get lastPosList(): LinkedList<number> {
    return this._lastPosList;
  }

  get count(): number {
    return this._count;
  }

  get data(): string {
    return this._data;
  }

  get isNullable(): boolean {
    return this._isNullable;
  }

  set data(data: string) {
    this._data = data;
  }

  get leftNode(): Node | null {
    return this._leftNode;
  }

  set leftNode(leftNode: Node | null) {
    this._leftNode = leftNode;
  }

  get rightNode(): Node | null {
    return this._rightNode;
  }

  set rightNode(rightNode: Node | null) {
    this._rightNode = rightNode;
  }
}

export { Node }