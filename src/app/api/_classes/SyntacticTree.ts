import { Node } from "./Node";

class SyntacticTree {
  private _root: Node;

  constructor(root: Node) {
      this._root = root;
  }

  get root(): Node {
      return this._root;
  }

  set root(root: Node) {
      this._root = root;
  }
}

export { SyntacticTree };