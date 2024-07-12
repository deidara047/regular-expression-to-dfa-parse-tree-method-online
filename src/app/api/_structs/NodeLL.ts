export class NodeLL<T> {
  value: T;
  next: NodeLL<T> | null = null;

  constructor(value: T) {
      this.value = value;
  }
}
