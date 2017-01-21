const { __fitInTTY, __logger } = require('./logger')

describe('fitInTTY', () => {

  it('truncates str to 9 chars', () => {
    const _stdout = {
      columns: 10
    }
    expect(__fitInTTY(_stdout)("I wont fit in tty")).toMatchSnapshot()
  });

});

describe('logger', () => {

  let _stdout, _fitInTTY
  beforeEach(() => {
    _stdout = {
      write: jest.fn()
    }
    _fitInTTY = jest.fn(x => x)
  })

  it('should return a 1 param function', () => {
    expect(__logger(_stdout, _fitInTTY)(['']).length).toBe(1)
  });

  it('should write to stdout correctly', () => {
    const msgs = [null, 'uno']
    __logger(_stdout, _fitInTTY)(msgs)(msgs)
    const exp = [
      ['null\n'],
      ['uno\n'],
      ['\x1B[2A\r'],
      ['\x1B[1B\r'],
      ['\x1B[2Kuno\n']
    ]
    expect(_stdout.write.mock.calls).toEqual(exp)
  });

});