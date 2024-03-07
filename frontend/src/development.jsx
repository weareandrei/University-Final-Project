import React from 'react'
import {createRoot} from 'react-dom/client'
import App from './app'
import './style.css'

const container = document.getElementById('root')
const root = createRoot(container)

const launch = (Component) => {
    root.render(
        <Component/>
    )
}

launch(App)
