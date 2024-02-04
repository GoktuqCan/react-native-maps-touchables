
# react-native-maps-touchables
Touchable area fix for [`react-native-maps`](https://github.com/airbnb/react-native-maps/) Markers on Android. Creates touchable areas for Markers.


https://github.com/GoktuqCan/react-native-maps-touchables/assets/15637944/d071a839-634a-4b72-afc6-0b1751f4ff7f




## Installation
```
yarn add react-native-maps-touchables
```
or
```
npm install react-native-touchables
```
## Basic Usage
Replace **MapView** from `react-native-maps` with `react-native-maps-touchables`

```diff
- import { MapView } from 'react-native-maps';
+ import { MapView } from 'react-native-maps-touchables';
```
### Example
```JavaScript
import React from 'react';
import { Text, View } from 'react-native';
import { Marker } from 'react-native-maps';
import { MapView } from 'react-native-maps-touchables';

const markers = [
  {
    latitude: 37.800332,
    longitude: -122.421301,
    height: 20,
    width: 70,
    zIndex: 2,
    item: {
      id: 3,
      color: 'red',
    },
  },
  {
    latitude: 37.79736,
    longitude: -122.429799,
    height: 40,
    width: 40,
    zIndex: 1,
    item: {
      id: 4,
      color: 'blue',
    },
  },
];

const BasicUsage = () => {
  return (
    <MapView
      // ...react-native-maps props
      markerLocations={markers}
      onTouch={(item, index) => {
        console.log(item, index);
      }}
    >
      {markers.map((marker, index) => (
        <Marker
          zIndex={marker.zIndex}
          coordinate={{
            latitude: marker.latitude,
            longitude: marker.longitude,
          }}
          key={marker.latitude + '-' + marker.longitude + '-' + index}
        >
          <View
            style={{
              width: marker.width,
              height: marker.height,
              backgroundColor: marker.item.color,
            }}
          >
            <Text>{index}</Text>
          </View>
        </Marker>
      ))}
    </MapView>
  );
};

export default BasicUsage;
```
## Props

|Prop|Type  | Notes|
|------|-------|---|
|`...MapViewProps`  |  | All **react-native-maps** [MapView](https://github.com/react-native-maps/react-native-maps/blob/master/docs/mapview.md#props) props are supported.|
|`markerLocations`| `MarkerLocation[]`| **Required**. See example for usage. |
|`onTouch`| `(item?:any,index?:number)=>void`| This callback receives `item` field from `MarkerLocation` and `index` of the touched marker in `markerLocations`. If user touches outside of the markers both are `undefined`.
|rotateEnabled|`boolean`|Default is `false`. This prop is not supported yet.

### MarkerLocation
|Field|Type|Notes
|---|---|--|
|`latitude`|number|**Required**
|`longitude`|number|**Required**
|`width`|number|**Required**. Width of the marker must be predefined.
|`height`|number|**Required**. Height of the marker must be predefined.
|`item`|any|This will be passed to `onTouch` callback.

## Known Issues
* `rotateEnabled` is not supported yet.
