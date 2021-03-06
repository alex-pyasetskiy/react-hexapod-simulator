import React from "react"
import { HashRouter as Router, Route, Switch, Redirect } from "react-router-dom"
import { VirtualHexapod, getNewPlotParams } from "./hexapod"
import * as configs from "./configs"
import { SECTION_NAMES, PATHS } from "./components/vars"
import { Nav, NavDetailed, HexapodPlot, DimensionsWidget } from "./components"
import {
    ForwardKinematicsPage,
    InverseKinematicsPage,
    LandingPage,
    LegPatternPage,
    WalkingGaitsPage,
} from "./components/pages"


class App extends React.Component {
    plot = {
        cameraView: configs.CAMERA_VIEW,
        data: configs.DATA,
        layout: configs.LAYOUT,
    }

    state = {
        inHexapodPage: false,
        hexapodDimensions: configs.DEFAULT_DIMENSIONS,
        hexapodPose: configs.DEFAULT_POSE,
        revision: 0,
    }

    /* * * * * * * * * * * * * *
     * Page load and plot update handlers
     * * * * * * * * * * * * * */

    onPageLoad = pageName => {
        if (pageName === SECTION_NAMES.landingPage) {
            this.setState({ inHexapodPage: false })
            return
        }

        this.setState({ inHexapodPage: true })
        this.updatePlot(this.state.hexapodDimensions, configs.DEFAULT_POSE)
    }

    updatePlotWithHexapod = hexapod => {
        if (!hexapod || !hexapod.foundSolution) {
            return
        }

        const [data, layout] = getNewPlotParams(hexapod, this.plot.cameraView)
        this.plot = { ...this.plot, data, layout }

        this.setState({
            revision: this.state.revision + 1,
            hexapodDimensions: hexapod.dimensions,
            hexapodPose: hexapod.pose,
        })
    }

    logCameraView = relayoutData => {
        this.plot.cameraView = relayoutData["scene.camera"]
    }

    updatePlot = (dimensions, pose) => {
        const newHexapodModel = new VirtualHexapod(dimensions, pose)
        this.updatePlotWithHexapod(newHexapodModel)
    }

    updateDimensions = dimensions => this.updatePlot(dimensions, this.state.hexapodPose)

    updatePose = pose => this.updatePlot(this.state.hexapodDimensions, pose)

    /* * * * * * * * * * * * * *
     * Widgets
     * * * * * * * * * * * * * */

    hexapodPlot = () => {
        const { revision, inHexapodPage } = this.state
        const { data, layout } = this.plot
        const props = { data, layout, revision, onRelayout: this.logCameraView }

        return (
            <div hidden={!inHexapodPage} className="plot border">
                <HexapodPlot {...props} />
            </div>
        )
    }

    dimensions = () => (
        <div hidden={!this.state.inHexapodPage}>
            <DimensionsWidget
                params={{ dimensions: this.state.hexapodDimensions }}
                onUpdate={this.updateDimensions}
            />
        </div>
    )

    navDetailed = () => (
        <div hidden={!this.state.inHexapodPage}>
            <NavDetailed />
        </div>
    )

    /* * * * * * * * * * * * * *
     * Pages
     * * * * * * * * * * * * * */
    get hexapodParams() {
        return {
            dimensions: this.state.hexapodDimensions,
            pose: this.state.hexapodPose,
        }
    }

    pageComponent = (Component, onUpdate, params) => (
        <Component onMount={this.onPageLoad} onUpdate={onUpdate} params={params} />
    )

    pageLanding = () => this.pageComponent(LandingPage)

    pagePatterns = () => this.pageComponent(LegPatternPage, this.updatePose)

    pageIk = () =>
        this.pageComponent(
            InverseKinematicsPage,
            this.updatePlotWithHexapod,
            this.hexapodParams
        )

    pageFk = () =>
        this.pageComponent(ForwardKinematicsPage, this.updatePose, {
            pose: this.state.hexapodPose,
        })

    pageWalking = () =>
        this.pageComponent(
            WalkingGaitsPage,
            this.updatePlotWithHexapod,
            this.hexapodParams
        )

    page = () => (
        <Switch>
            <Route path="/" exact component={this.pageLanding} />
            <Route path={PATHS.legPatterns.path} exact component={this.pagePatterns} />
            <Route path={PATHS.forwardKinematics.path} exact component={this.pageFk} />
            <Route path={PATHS.inverseKinematics.path} exact component={this.pageIk} />
            <Route path={PATHS.walkingGaits.path} exact component={this.pageWalking} />
            <Route>
                <Redirect to="/" />
            </Route>
        </Switch>
    )

    /* * * * * * * * * * * * * *
     * Layout
     * * * * * * * * * * * * * */

    render = () => (
        <Router>
            <Nav />
            <div className="main content">
                <div className="controls page-content">
                    {/* {this.dimensions()} */}
                    {this.page()}
                </div>
                {this.hexapodPlot()}
            </div>
        </Router>
    )
}

export default App
