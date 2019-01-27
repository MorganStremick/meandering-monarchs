function generateMultiDimensionalArray(dim, func) {
  if (dim.length === 0) {
    return func();
  }
  const arr = [];
  for (let i = 0; i < dim[0]; i++) {
    arr.push(generateMultiDimensionalArray(dim.slice(1), func));
  }
  return arr;
}

function generateMultiDimensionalZeroArray(dim) {
  return generateMultiDimensionalArray(dim, () => 0);
}

function generateConstantArray(val, length) {
  return generateMultiDimensionalArray([length], () => val);
}

function assign(arr, indices, value) {
  if (indices.length === 1) {
    arr.splice(indices[0], 1, value);
    return arr;
  }
  assign(arr[indices[0]], indices.slice(1), value);
  return arr;
}

function mutateArray(arr, indices, func, value) {
  if (indices.length === 0) {
    arr[func](value);
  } else {
    mutateArray(arr[indices[0]], indices.slice(1), func, value);
  }
}

function multiDimensionalLookup(arr, indices) {
  if (indices.length === 0) {
    return arr;
  } else {
    return multiDimensionalLookup(arr[indices[0]], indices.slice(1));
  }
}

function recursiveMap(data, func) {
  if (!(data instanceof Array)) {
    return func(data);
  }
  return _.map(data, value => recursiveMap(value, func));
}

const queen = {
  create: function (dim) {
    const self = Object.create(this);
    if(dim !== this.dim) {
      this.dim = dim;
      this.generateAdjacencyList();
    }
    self.position = _.map(dim, bound =>_.random(0, bound - 1));
    return self;
  },

  generateAdjacencyList: function () {
    this.adjacencyList = generateMultiDimensionalArray(this.dim, () => []);
    const position = this.dim.slice();
    this.generateAdjacencyListAux(position, this.dim.length);
  },

  generateAdjacencyListAux: function (position, n) {
    if (n === 0) {
      this.generateIndividualList(position);
    } else {
      const temp = position[n - 1];
      while(position[n - 1] > 0) {
        position[n - 1]--;
        this.generateAdjacencyListAux(position, n - 1);
      }
      position[n - 1] = temp;
    }
  },

  generateIndividualList: function (position) {
    const distanceToBoundaryArr = _.map(this.dim, (bound, index) => bound - position[index] - 1);
    for (let i = 1; i < Math.pow(3, this.dim.length); i++) {
      const directionVector = this.generateDirectionVector(i);
      const iteratee = function (min, distance, index) {
        switch (directionVector[index]) {
          case -1:
            return Math.min(min, position[index]);
          case 0:
            return min;
          case 1:
            return Math.min(min, distance);
        }
      };
      const min = _.reduce(distanceToBoundaryArr, iteratee, Infinity);
      let current  = position;
      for (let j = 0; j < min; j++) {
        current = _.map(current, (coordinate, index) => coordinate + directionVector[index]);
        mutateArray(this.adjacencyList, position, 'push', current);
      }
    }
  },

  generateDirectionVector: function (i) {
    let directionVector = i.toString(3).split('').reverse();
    directionVector = _.map(directionVector, val => 3/2 * Math.pow(parseInt(val), 2) - 5/2 * parseInt(val));
    const buffer = generateConstantArray(0, this.dim.length);
    directionVector = directionVector.concat(buffer);
    return directionVector;
  },

  step: function () {
    const adjacent = multiDimensionalLookup(this.adjacencyList, this.position);
    const rand = _.random(0, adjacent.length - 1);
    this.position = adjacent[rand];
  },
};

const king = {
  create: function (dim) {
    const self = Object.create(this);
    if(dim !== this.dim) {
      this.dim = dim;
      this.generateAdjacencyList();
    }
    self.position = _.map(dim, bound =>_.random(0, bound - 1));
    return self;
  },

  generateAdjacencyList: function () {
    this.adjacencyList = generateMultiDimensionalArray(this.dim, () => []);
    const position = this.dim.slice();
    this.generateAdjacencyListAux(position, this.dim.length);
  },

  generateAdjacencyListAux: function (position, n) {
    if (n === 0) {
      this.generateIndividualList(position);
    } else {
      const temp = position[n - 1];
      while(position[n - 1] > 0) {
        position[n - 1]--;
        this.generateAdjacencyListAux(position, n - 1);
      }
      position[n - 1] = temp;
    }
  },

  generateIndividualList: function (position) {
    for (let i = 1; i < Math.pow(3, this.dim.length); i++) {
      const directionVector = this.generateDirectionVector(i);
      const current = _.map(position, (coordinate, index) => coordinate + directionVector[index]);
      if(_.every(current, (coordinate, index) => coordinate >= 0 && coordinate < this.dim[index])) {
        mutateArray(this.adjacencyList, position, 'push', current);
      }
    }
  },

  generateDirectionVector: function (i) {
    let directionVector = i.toString(3).split('').reverse();
    directionVector = _.map(directionVector, val => 3/2 * Math.pow(parseInt(val), 2) - 5/2 * parseInt(val));
    const buffer = generateConstantArray(0, this.dim.length);
    directionVector = directionVector.concat(buffer);
    return directionVector;
  },

  step: function () {
    const adjacent = multiDimensionalLookup(this.adjacencyList, this.position);
    const rand = _.random(0, adjacent.length - 1);
    this.position = adjacent[rand];
  },
};

const board = {
  create: function (dim, chessPiece, numberOfPieces) {
    const self = Object.create(board);
    self.dim = dim;
    self.pieces = [];
    for (let i = 0; i < numberOfPieces; i++) {
      self.pieces.push(chessPiece.create(dim));
    }
    return self;
  },

  step: function (n) {
    for (let i = 0; i < n; i++) {
      for (const piece of this.pieces) {
        piece.step();
      }
    }
  },

  toArray: function () {
    const boardRepresentation = generateMultiDimensionalZeroArray(this.dim);
    const distribution = _.pairs(_.countBy(this.pieces, 'position'));
    const iteratee = function (val) {
      let position = val[0].split(',');
      position = _.map(position, coordinate => Number(coordinate));
      assign(boardRepresentation, position, val[1]);
    };
    _.each(distribution, iteratee);
    return boardRepresentation;
  },

  toPercentArray: function () {
    return recursiveMap(this.toArray(), val => Math.floor(val / this.pieces.length * 100));
  },

  probabilityCheck: function () {
    const arr0 = this.toArray();
    const arr = [];
    arr[2] = arr0[0][0] + arr0[0][3] + arr0[3][0] + arr0[3][3];
    arr[1] = arr0[0][1] + arr0[0][2] + arr0[1][3] + arr0[2][3];
    arr[1] += arr0[3][2] + arr0[3][1] + arr0[2][0] + arr0[1][0];
    arr[0] = arr0[1][1] + arr0[1][2] + arr0[2][1] + arr0[2][2];
    return arr;
  }
};

const p = 100000;
const n = 10;
const dim = [4, 4];
const DEFAULT_DIM = [4, 4];

console.log(`# of pieces = ${p}`);
console.log(`turns = ${n}\n\n`);

console.log('Wandering Queen');
const qb = board.create(dim, queen, p);
qb.step(n);
console.log(qb.toArray());
if (_.isEqual(dim, DEFAULT_DIM)) {
  console.log(qb.probabilityCheck());
}
console.log('\n');

console.log('Wandering King');
const kb = board.create(dim, king, p);
kb.step(n);
console.log(kb.toArray());
if (_.isEqual(dim, DEFAULT_DIM)) {
  console.log(kb.probabilityCheck());
}
