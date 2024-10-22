import React, { useRef, useState } from 'react'
import './app.css'

import CaveSettings from './cave/caveSettings'
import { CaveGenerator } from './delaunay/caveGenerator'

const App = () => {
    const [caveGenerator, setCaveGenerator] = useState(null)
    const canvasRef = useRef(null)

    const handleInitialize = settings => {
        setCaveGenerator(
            new CaveGenerator(settings.cavePositions, canvasRef.current)
        )
    }

    const handleFindPath = settings => {
        caveGenerator.findCavePath(settings)
        caveGenerator.renderCanvas()
    }

    return (
        <div style={style.appContainer}>
            <CaveSettings
                onInitialize={handleInitialize}
                onFindPath={handleFindPath}
                style={{ width: '40%' }}
            />
            <canvas
                ref={canvasRef}
                width={400}
                height={400}
                style={style.canvasContainer}
            />
        </div>
    )
}

const style = {
    appContainer: {
        display: 'flex',
        flexDirection: 'row',
        padding: '15px',
    },
    canvasContainer: {
        width: '60%',
        height: 'fit-content',
        marginLeft: '2%',
        border: '1px black solid',
    },
}

export default App
