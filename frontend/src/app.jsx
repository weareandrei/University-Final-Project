import React, {useState} from 'react'
import './app.css'

import CaveSettings from "./cave/caveSettings"
import CaveResult from "./cave/caveResult"
import {DelaunayGraph} from "./delaunay/delaunayGraph"

const App = () => {

    const [delaunayGraph, setDelaunayGraph] = useState(null)

    const handleInitialize = (settings) => {
        const newDelaunayGraph = new DelaunayGraph(settings)
        setDelaunayGraph(newDelaunayGraph);
    }

    const handleFindPath = (settings) => {
        delaunayGraph.findCavePath(settings)
        delaunayGraph.renderSVG()
    }

    const handleExtendCaveStructure = (width) => {
        delaunayGraph.extendCaveStructure(width)
        console.log('renderSVG')
        delaunayGraph.renderSVG()
    }

    return (
        <div style={style.appContainer}>
            <CaveSettings onInitialize={handleInitialize}
                          onFindPath={handleFindPath}
                          onExtendCaveStructure={handleExtendCaveStructure}
                          style={{width: '40%'}}/>
            <CaveResult delaunayGraph={delaunayGraph}
                        style={{
                            width: '60%',
                            height: 'fit-content',
                            marginLeft: '2%',
                            border: '1px black solid'
                        }}/>
        </div>
    )
}

const style = {
    appContainer: {
        display: 'flex',
        flexDirection: 'row',
        padding: '15px'
    }
}

export default App
