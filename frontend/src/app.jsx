import React, {useState} from 'react'
import './app.css'

import CaveSettings from "./cave/caveSettings"
import CaveResult from "./cave/caveResult"
import DelaunayGraph from "./delaunay/delaunayGraph"

const App = () => {

    const [delaunayGraph, setDelaunayGraph] = useState(null)

    const handleInitialize = (settings) => {
        const newDelaunayGraph = new DelaunayGraph(settings)
        setDelaunayGraph(newDelaunayGraph);
    }

    return (
        <div style={style.appContainer}>
            <CaveSettings onInitialize={handleInitialize}
                          style={{width: '40%'}}/>
            <CaveResult delaunayGraph={delaunayGraph}
                        style={{
                            width: '60%',
                            marginLeft: '2%',
                            border: '1px black solid'
                        }}/>
        </div>
    )
}

const generateCave = (settings) => {
    console.log('generateCave settings', settings)
    this.setState({
        settings: settings,
        currentStage: 'generateCave'
    })
}

const findCavePath = (cavePath) => {
    console.log('findCavePath cavePath', cavePath)
    this.setState({
        cavePath: cavePath,
        currentStage: 'findCavePath'
    })
}

const style = {
    appContainer: {
        display: 'flex',
        flexDirection: 'row',
        padding: '15px'
    }
}

export default App
