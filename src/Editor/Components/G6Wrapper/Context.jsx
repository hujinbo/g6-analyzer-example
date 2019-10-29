import React from 'react'

const CanvasContext = React.createContext({
  mount: false,
  ref: null,
  setCanvasRef: () => { },
});

export default CanvasContext