class Filters {
  private filters: string[];
  constructor() {
    this.filters = [];
  }

  set(array: string[]) {
    this.filters = array;
  }
  addValue(value: string) {
    this.filters.push(value);
  }
  removeByValue(value: string) {
    this.filters = this.filters.filter((f) => f !== value);
  }
  getAll() {
    return this.filters;
  }
}
export default new Filters();
