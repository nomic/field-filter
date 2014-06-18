# Field filter
`npm install field-filter`

Implements the partial response query filter method as seen [here](https://developers.google.com/youtube/v3/getting-started)

### Examples
```js
var filter = require('field-filter');

var input = {
  a: 'a',
  b: 'b',
  c: 'c'
};

var filterString = 'a,b';

filter(filterString, input);
{
  a: 'a',
  b: 'b'
}

var input = {
  a: {
    b: {
      c: {
        d: {
          e: 'e',
          f: 'f'
        },
        g: 'g'
      },
      f: 'f'
    },
    g: {
      h: 'h'
    }
  }
};

// () and / to sub-select
var filterString = 'a( b/c( d/e ) , g)';

filter(filterString, input)
{
  a: {
    b: {
      c: {
        d: {
          e: 'e'
        }
      }
    },
    g: {
      h: 'h'
    }
  }
}

// wildcard *
var input = {
  a: {
    b: {
      c: 'c',
      d: 'd'
    },
    e: {
      c: 'c',
      f: 'f'
    }
  },
  g: {
    h: {
      i: 'i',
      j: 'j'
    },
    k: {
      i: 'i',
      j: 'j'
    }
  },
  m: 'm'
};

var filterString = 'a/*/c,g(*(i, j)),*';

filter(filterString, input)
{
  a: {
    b: {
      c: 'c'
    },
    e: {
      c: 'c'
    }
  },
  g: {
    h: {
      i: 'i',
      j: 'j'
    },
    k: {
      i: 'i',
      j: 'j'
    }
  },
  m: 'm'
});


// array index
var input = [
  {
    a: 'a',
    b: [
      'c',
      'd'
    ]
  },
  {
    e: 'e'
  }
];

var filterString = '0(a,b/1)';

filter(filterString, input)
[
  {
    a: 'a',
    b: [
      undefined,
      'd'
    ]
  }
]);
```
