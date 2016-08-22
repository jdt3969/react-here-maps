import * as React from 'react';
import { isEqual } from 'lodash';

import cache from './utils/cache';
import getScriptMap from './utils/get-script-map';
import getLink from './utils/get-link';
import getPlatform from './utils/get-platform';

// declare a standard callback type
type Callback = (error: any, result?: any) => void;

// declare an interface for a single script tag object
interface ScriptTag {
    tag: HTMLScriptElement;
    onLoad(callback: Callback): void;
}

// declare an interface for the script tags object
// that stores info on each requested script
interface ScriptTags {
    [name: string]: ScriptTag;
}

// declare an interface containing the required and potential
// props that can be passed to the HEREMap component
interface HEREMapProps {
    appId: string;
    appCode: string;
    center: H.geo.IPoint;
    zoom: number;
}

// declare an interface containing the potential state flags
interface HEREMapState {
    loaded: boolean;
    map: any;
}

// export the HEREMap React Component from this module
export class HEREMap extends React.Component<HEREMapProps, HEREMapState> {
    scriptMap: ScriptTags = null;

    state: HEREMapState = {
        loaded: false,
        map: null,
    };

    componentDidMount() {
        this.scriptMap['mapEventsScript'].onLoad((err, tag) => {
            const {
                appId,
                appCode,
                center,
                zoom,
            } = this.props;

            // get the platform to base the maps on
            const platform = getPlatform({
                app_id: appId,
                app_code: appCode
            });

            const defaultLayers = platform.createDefaultLayers();

            const map = new H.Map(
                document.getElementById('mapContainer'),
                defaultLayers.normal.map,
                {
                    zoom,
                    center,
                }
            );

            // make the map interactive
            // MapEvents enables the event system
            // Behavior implements default interactions for pan/zoom
            const behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(map));

            // create the default UI for the map
            const ui = H.ui.UI.createDefault(map, defaultLayers);

            // attach the map object to the component's state
            this.setState({
                map,
            } as HEREMapState);
        });
    }

    componentWillMount() {
        this.scriptMap = cache(getScriptMap());

        const stylesheetUrl =
            'http://js.api.here.com/v3/3.0/mapsjs-ui.css';

        getLink(stylesheetUrl, 'HERE Maps UI');
    }

    setCenter(point: H.geo.IPoint) {
        const { map } = this.state;
        map.setCenter(point, true);
    }

    setZoom(zoom: number) {
        const { map } = this.state;
        map.setZoom(zoom, true);
    }

    componentWillReceiveProps(nextProps: HEREMapProps) {
        if (!isEqual(nextProps.center, this.props.center)) {
            this.setCenter(nextProps.center);
        }

        if (nextProps.zoom !== this.props.zoom) {
            this.setZoom(nextProps.zoom);
        }
    }

    render() {
        return (
            <div>
                <div ref="map" id="mapContainer" style={{ height: '100%' }} />
            </div>
        )
    }
}

// make the HEREMap component the default export
export default HEREMap;
