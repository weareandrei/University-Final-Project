import React from 'react'
import PropTypes from 'prop-types'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Grid from '@mui/material/Grid'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'

export default class CaveSettings extends React.Component {
    static propTypes = {
        onInitialize: PropTypes.func.isRequired,
        onFindPath: PropTypes.func.isRequired,
        style: PropTypes.object,
    }

    static defaultProps = {
        style: {},
    }

    state = {
        cavePositions: [],
        startCaveIndex: '0',
        endCaveIndex: '3',
        noiseLevel: '1',

        delaunayDrawn: false,
        pathDrawn: false,
    }

    render = () => (
        <Box sx={{ ...this.props.style }}>
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <Paper>
                        <TextField
                            label="JSON Positions"
                            fullWidth
                            multiline
                            value={this.state.cavePositions}
                            onChange={e =>
                                this.handleChange(
                                    'cavePositions',
                                    e.target.value
                                )
                            }
                        />
                    </Paper>
                </Grid>

                <Grid item xs={12}>
                    <Button
                        variant="outlined"
                        onClick={this.generateRandomPositions}
                    >
                        Generate Random Positions
                    </Button>
                </Grid>

                <Grid
                    item
                    xs={12}
                    style={{ display: 'flex', flexDirection: 'row' }}
                >
                    <Paper style={{ width: '40%', marginRight: '12px' }}>
                        <TextField
                            label="startCaveIndex"
                            fullWidth
                            value={this.state.startCaveIndex}
                            onChange={e =>
                                this.handleChange(
                                    'startCaveIndex',
                                    e.target.value
                                )
                            }
                        />
                    </Paper>
                    <Paper style={{ width: '40%' }}>
                        <TextField
                            label="endCaveIndex"
                            fullWidth
                            value={this.state.endCaveIndex}
                            onChange={e =>
                                this.handleChange(
                                    'endCaveIndex',
                                    e.target.value
                                )
                            }
                        />
                    </Paper>
                </Grid>

                <Grid item xs={12}>
                    <Button variant="outlined" onClick={this.generateCavePath}>
                        Generate Voronoi Diagrams
                    </Button>
                </Grid>

                {this.state.delaunayDrawn && (
                    <React.Fragment>
                        <Grid item xs={12}>
                            <Paper style={{ width: '40%' }}>
                                <TextField
                                    label="Noise Level"
                                    fullWidth
                                    value={this.state.noiseLevel}
                                    onChange={e =>
                                        this.handleChange(
                                            'noiseLevel',
                                            e.target.value
                                        )
                                    }
                                />
                            </Paper>
                        </Grid>
                        <Grid item xs={12}>
                            <Button
                                variant="outlined"
                                onClick={this.findCavePath}
                            >
                                Generate cave path
                            </Button>
                        </Grid>
                    </React.Fragment>
                )}
            </Grid>
        </Box>
    )

    handleChange = (field, value) => {
        this.setState({ [field]: value })
    }

    generateRandomPositions = () => {
        const minPositions = 15
        const maxPositions = 35
        const minX = 0
        const maxX = 1500
        const minY = 0
        const maxY = 1500

        const numberOfPositions =
            Math.floor(Math.random() * (maxPositions - minPositions + 1)) +
            minPositions

        const randomPositions = []

        for (let i = 0; i < numberOfPositions; i++) {
            const randomX = Math.floor(Math.random() * (maxX - minX + 1)) + minX
            const randomY = Math.floor(Math.random() * (maxY - minY + 1)) + minY
            randomPositions.push([randomX, randomY])
        }

        const stringifiedArray = JSON.stringify(randomPositions)

        this.setState({ cavePositions: stringifiedArray }, () => {
            console.log('Generated random positions:', this.state.cavePositions)
        })
    }

    generateCavePath = () => {
        const { cavePositions, cavesMaxRadius } = this.state
        this.setState({ delaunayDrawn: true })
        this.setState({ pathDrawn: false })

        this.props.onInitialize({
            cavePositions: JSON.parse(cavePositions),
            cavesMaxRadius: parseInt(cavesMaxRadius),
        })
    }

    findCavePath = () => {
        const { startCaveIndex, endCaveIndex, noiseLevel } = this.state

        this.props.onFindPath({
            startIndex: parseInt(startCaveIndex),
            endIndex: parseInt(endCaveIndex),
            noiseLevel: parseInt(noiseLevel),
        })

        this.setState({ pathDrawn: true })
    }
}
