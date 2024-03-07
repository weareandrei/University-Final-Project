import React, { useEffect, useRef } from 'react'

const CaveResult = ({ delaunayGraph, style = {} }) => {
    const svgRef = useRef()

    useEffect(() => {
        if (delaunayGraph !== null) {
            svgRef.current.innerHTML = ''
            delaunayGraph.renderSVG(svgRef)
        }
    }, [delaunayGraph])

    return (
        <div style={style}>
            <svg ref={svgRef}>
            </svg>
        </div>
    )
}

export default CaveResult

