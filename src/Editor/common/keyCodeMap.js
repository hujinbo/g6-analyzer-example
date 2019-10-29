
const keyCodeMap = {
  whitespace: {
    9: 'Tab', 13: 'Enter', 32: 'Space'
  },
  fn: {
    112: 'f1 ', 113: 'f2 ', 114: 'f3 ', 115: 'f4 ', 116: 'f5 ', 117: 'f6 ', 118: 'f7 ', 119: 'f8 ', 120: 'f9 ', 121: 'f10', 122: 'f11', 123: 'f12'
  },
  letter: {
    65: 'a', 66: 'b', 67: 'c', 68: 'd', 69: 'e', 70: 'f', 71: 'g', 72: 'h', 73: 'i', 74: 'j', 75: 'k', 76: 'l', 77: 'm', 78: 'n', 79: 'o', 80: 'p', 81: 'q', 82: 'r', 83: 's', 84: 't', 85: 'u', 86: 'v', 87: 'w', 88: 'x', 89: 'y', 90: 'z'
  },
  number: {
    48: '0', 49: '1', 50: '2', 51: '3', 52: '4', 53: '5', 54: '6', 55: '7', 56: '8', 57: '9'
  },
  navigation: {
    37: 'ArrowLeft', 38: 'ArrowUp', 39: 'ArrowRight', 40: 'ArrowDown'
  },
  symbol: {
    110: 'decimal point', 186: 'semi-colon', 187: '=', 188: 'comma', 189: '-', 190: 'period ', 191: '/', 192: 'grave accent', 219: 'open bracket ', 220: 'back slash ', 221: 'close bracket ', 222: 'single quote '
  },
  smallNumberKey: {
    96: 'numpad 0 ', 97: 'numpad 1 ', 98: 'numpad 2 ', 99: 'numpad 3 ', 100: 'numpad 4 ', 101: 'numpad 5 ', 102: 'numpad 6 ', 103: 'numpad 7 ', 104: 'numpad 8 ', 105: 'numpad 9 '
  },
  modifierKey: {
    16: 'Shift', 17: 'Ctrl ', 18: 'Alt', 20: 'caps lock'
  },
  escKey: {
    8: 'Backspace', 46: 'Delete', 27: 'Escape'
  },
  homeKey: {
    91: 'Windows Key / Left command', 92: 'right window key ', 93: 'Windows Menu'
  },
  computeKey: {
    106: 'multiply ', 107: 'add', 109: 'subtract ', 111: 'divide '
  }
}

export default keyCodeMap