'use strict';

var filter = require('./index');
var chai = require('chai');
var expect = chai.expect;

describe('Filter', function () {
  it('basic keys', function () {
    var input = {
      a: 'a',
      b: 'b',
      c: 'c'
    };

    var filterString = 'a,b';

    expect(filter(filterString, input)).to.deep.equal({
      a: 'a',
      b: 'b'
    });
  });

  it('nested params by /', function () {
    var input = {
      a: {
        b: 'b',
        c: 'c'
      },
      d: 'd'
    };

    var filterString = 'a/b,d';

    expect(filter(filterString, input)).to.deep.equal({
      a: {
        b: 'b'
      },
      d: 'd'
    });
  });

  it('nested params by ()', function () {
    var input = {
      a: {
        b: 'b',
        c: 'c',
        d: 'd'
      },
      e: 'e'
    };

    var filterString = 'a(b,c),e';

    expect(filter(filterString, input)).to.deep.equal({
        a: {
          b: 'b',
          c: 'c',
        },
        e: 'e'
    });
  });

  it('multiple nested ()', function () {
    var input = {
      a: {
        b: {
          c: {
            d: 'd',
            e: 'e'
          },
          f: 'f'
        },
        g: {
          h: 'h'
        }
      }
    };

    var filterString = 'a(b(c(d,e)))';

    expect(filter(filterString, input)).to.deep.equal({
      a: {
        b: {
          c: {
            d: 'd',
            e: 'e'
          }
        }
      }
    });
  });

  it('combines / with ()', function () {
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

    var filterString = 'a( b/c( d/e ) , g)';

    expect(filter(filterString, input)).to.deep.equal({
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
    });
  });

  it('works with arrays', function () {
    var input = {
      a: [
        {
          b: 'b',
          c: 'c'
        },
        {
          b: 'b',
          d: 'd'
        },
      ]
    };

    var filterString = 'a/b';

    expect(filter(filterString, input)).to.deep.equal({
      a: [
        {
          b: 'b'
        },
        {
          b: 'b'
        },
      ]
    });
  });

  it('supports simple *', function () {
    var input = {
      a: {
        b: {
          c: 'c'
        },
        d: 'd'
      },
      b: 'b',
      c: 'c'
    };

    var filterString = '*,a/b/c';

    expect(filter(filterString, input)).to.deep.equal({
      a: {
        b: {
          c: 'c'
        }
      },
      b: 'b',
      c: 'c'
    });
  });

  it('supports complex *', function () {
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

    expect(filter(filterString, input)).to.deep.equal({
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
  });

  it('supports array index specification', function () {
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

    expect(filter(filterString, input)).to.deep.equal([
      {
        a: 'a',
        b: [
          undefined,
          'd'
        ]
      }
    ]);
  });
});
