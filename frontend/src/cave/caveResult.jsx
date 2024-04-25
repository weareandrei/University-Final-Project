import React, { useEffect, useRef } from 'react'

const CaveResult = ({ delaunayGraph, style = {} }) => {
    const svgRef = useRef()

    useEffect(() => {
        if (delaunayGraph !== null) {
            renderResult()
        }
    }, [delaunayGraph])

    const renderResult = () => {
        svgRef.current.innerHTML = ''
        delaunayGraph.setRef(svgRef)
        delaunayGraph.renderSVG()
    }

    return (
        <div style={style}>
            <svg ref={svgRef}>
            </svg>
        </div>
    )
}

export default CaveResult

