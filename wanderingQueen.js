function constantArray(dim, val) {
  if (dim.length === 0) {
    return val;
  }
  const arr = [];
  for (let i = 0; i < dim[0]; i++) {
    arr.push(constantArray(dim.slice(1), val));
  }
  return arr;
}

function assign(arr, indices, value) {
  if (indices.length === 1) {
    arr.splice(indices[0], 1, value);
    return arr;
  }
  assign(arr[indices[0]], indices.slice(1), value);
  return arr;
}

function mapRecursive(data, func) {
  if (!(data instanceof Array)) {
    return func(data);
  }
  return _.map(data, value => mapRecursive(value, func));
}

class Queen {
  constructor (dim) {
    this.position = _.map(dim, val => _.random(0, val - 1));
  }

  step (dim) {
    const arr = this.generateArray(dim);
    const aux = constantArray([dim.length], 3);
    const open  = _.reduce(arr, (sum, obj) => sum + this.calculateTerm(aux, obj.distance, obj.index), 0);
    const random = _.random(1, open);
  }

  calculateTerm (aux, distance, index) {
    console.log({ distance: distance, index: index} );
    console.log(aux);
    aux[index]--;
    const coefficient = _.reduce(aux, (product, val, i) => product * (i !== index ? val : 1), 1);
    console.log(coefficient + '\n');
    return coefficient * distance;
  }

  generateArray (dim) {
    return _.sortBy((_.flatten(_.map(dim, (bound, index) => this.generateObjects(bound, index)))), 'distance');
  }

  generateObjects (bound, index) {
    const upperDistance = bound - this.position[index] - 1;
    const lowerDistance = this.position[index];
    return [{ distance: upperDistance, index: index }, { distance: lowerDistance, index: index }];
  }
}

const n = 10;
const temp = new Array(n);
const dim = [4, 4];
// console.log(_.pluck(_.map(temp, val => new Queen(dim)), 'position'));

// const queen = new Queen(dim);
// console.log(queen.position);
// console.log(queen.step(dim));
