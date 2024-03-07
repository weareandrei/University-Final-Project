import React, { useEffect, useRef } from 'react';
import { generateDelaunay } from '../delaunay/delaunay';

const CaveResult = ({ settings, style = {} }) => {
    const svgRef = useRef();

    useEffect(() => {
        svgRef.current.innerHTML = '';

        generateDelaunay(svgRef, settings);
    }, [settings]);

    return (
        <div style={style}>
            <svg ref={svgRef}>
            </svg>
        </div>
    );
};

export default CaveResult;

