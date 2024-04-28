import React, { useRef, useState } from 'react'
import './app.css'

import CaveSettings from "./cave/caveSettings"
import {DelaunayGraph2} from "./delaunay/delaunayGraph2"

const App = () => {
    const [delaunayGraph, setDelaunayGraph] = useState(null)
    const canvasRef = useRef(null);

    const handleInitialize = (settings) => {
        setDelaunayGraph(new DelaunayGraph2(settings.cavePositions, canvasRef.current));
    }

    const handleFindPath = (settings) => {
        delaunayGraph.findCavePath(settings)
        delaunayGraph.renderCanvas()
    }

    const handleExtendCaveStructure = (width) => {
        // delaunayGraph.extendCaveStructure(width)
        // delaunayGraph.renderCanvas()
    }

    return (
      <div style={style.appContainer}>
        <CaveSettings onInitialize={handleInitialize}
                      onFindPath={handleFindPath}
                      onExtendCaveStructure={handleExtendCaveStructure}
                      style={{ width: '40%' }} />
        <canvas ref={canvasRef} width={400} height={400} style={style.canvasContainer}/>
      </div>
    )
}

const style = {
    appContainer: {
        display: 'flex',
        flexDirection: 'row',
        padding: '15px'
    },
  canvasContainer: {
    width: '60%',
    height: 'fit-content',
    marginLeft: '2%',
    border: '1px black solid',
  }
}

export default App
