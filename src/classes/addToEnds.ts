class AddToEnds {
  private ends: string[];
  constructor() {
    this.ends = [];
  }

  set(array: string[]) {
    this.ends = array;
  }
  addValue(value: string) {
    this.ends.push(value);
  }
  removeByValue(value: string) {
    this.ends = this.ends.filter((f) => f !== value);
  }
  getAll() {
    return this.ends;
  }
}
export default new AddToEnds();
