import React from 'react'
import PropTypes from 'prop-types'
import './app.css'

import CaveSettings from "./cave/caveSettings"
import CaveResult from "./cave/caveResult"

export default class App extends React.Component {

    static propTypes = {

    }

    state = {
        settings: null
    }

    render = () =>
        <div style={style.appContainer}>
            <CaveSettings onGenerate={this.generateCave}
                          style={{width: '40%'}}/>
            <CaveResult settings={this.state.settings}
                        style={{
                            width: '60%',
                            marginLeft: '2%',
                            border: '1px black solid'
            }}/>
        </div>

    generateCave = (settings) => {
        console.log('settings', settings)
        this.setState({
            settings: settings
        })
    }
}

const style = {
    appContainer: {
        display: 'flex',
        flexDirection: 'row',
        padding: '15px'
    }
}
