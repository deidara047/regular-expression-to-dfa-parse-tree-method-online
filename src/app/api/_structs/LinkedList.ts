import { NodeLL } from "./NodeLL";

export class LinkedList<T> {
  head: NodeLL<T> | null = null;

  append(value: T): void {
    const newNode = new NodeLL(value);
    if (!this.head) {
      this.head = newNode;
      return;
    }

    let current = this.head;
    while (current.next) {
      current = current.next;
    }
    current.next = newNode;
  }

  appendSorted(value: T): void {
    const newNode = new NodeLL(value);

    if (!this.head || this.head.value >= value) {
      newNode.next = this.head;
      this.head = newNode;
      return;
    }

    let current = this.head;
    while (current.next && current.next.value < value) {
      current = current.next;
    }

    newNode.next = current.next;
    current.next = newNode;
  }

  printList(): void {
    let current = this.head;
    while (current) {
      console.log(current.value);
      current = current.next;
    }
  }

  delete(value: T): void {
    if (!this.head) {
      return;
    }

    if (this.head.value === value) {
      this.head = this.head.next;
      return;
    }

    let current = this.head;
    while (current.next && current.next.value !== value) {
      current = current.next;
    }

    if (current.next) {
      current.next = current.next.next;
    }
  }

  find(value: T): NodeLL<T> | null {
    let current = this.head;
    while (current && current.value !== value) {
      current = current.next;
    }
    return current;
  }

  addAll(linkedList: LinkedList<T>): void {
    let current = linkedList.head;
    while (current) {
      this.append(current.value);
      current = current.next;
    }
  }

  clone(): LinkedList<T> {
    const newList = new LinkedList<T>();
    let current = this.head;
    while (current) {
      newList.append(current.value);
      current = current.next;
    }
    return newList;
  }

  toString(): string {
    let current = this.head;
    let result = '';
    while (current) {
      result += current.value + (current.next ? ', ' : '');
      current = current.next;
    }
    return result;
  }

  isEmpty(): boolean {
    return this.head === null;
  }

  size(): number {
    let count = 0;
    let current = this.head;
    while (current) {
      count++;
      current = current.next;
    }
    return count;
  }

  get(index: number): T | null {
    if (index < 0) {
      return null;
    }

    let current = this.head;
    let i = 0;
    while (current) {
      if (i === index) {
        return current.value;
      }
      current = current.next;
      i++;
    }
    return null;
  }

  sort(): void {
    if (!this.head || !this.head.next) {
      return;
    }

    let swapped: boolean;
    do {
      swapped = false;
      let current = this.head;

      while (current.next) {
        if (current.value > current.next.value) {
          // Intercambiar los valores
          [current.value, current.next.value] = [current.next.value, current.value];
          swapped = true;
        }
        current = current.next;
      }
    } while (swapped);
  }

  removeDuplicates(): void {
    if (!this.head) {
      return;
    }

    const seenValues = new Set<T>();
    let current = this.head;
    seenValues.add(current.value);

    while (current.next) {
      if (seenValues.has(current.next.value)) {
        current.next = current.next.next;
      } else {
        seenValues.add(current.next.value);
        current = current.next;
      }
    }
  }

  toArray(): T[] {
    const array: T[] = [];
    let current = this.head;
    while (current) {
      array.push(current.value);
      current = current.next;
    }
    return array;
  }

  contains(value: T): boolean {
    let current = this.head;
    while (current) {
        if (current.value === value) {
            return true;
        }
        current = current.next;
    }
    return false;
}
}
