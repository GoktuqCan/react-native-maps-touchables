import React, { LegacyRef, forwardRef, useCallback, useMemo, useRef, useState } from 'react';
import { GestureResponderEvent, NativeSyntheticEvent, Pressable, StyleSheet } from 'react-native';
import RnMapView, { Details, MapViewProps, Region } from 'react-native-maps';
import { MarkerLocation } from '..';

type MarkerPosition = {
  left: number;
  right: number;
  top: number;
  bottom: number;
  zIndex: number;
  item?: any;
};

const MapView = (
  {
    children,
    style,
    onMapReady,
    markerLocations,
    onRegionChangeComplete,
    onTouch,
    ...props
  }: MapViewProps & {
    markerLocations: MarkerLocation[];
    onTouch?: (item?: any, index?: number) => void;
  },
  ref: LegacyRef<any> | undefined,
) => {
  const mapContainerRef = useRef<typeof Pressable>();
  const backupRef = useRef();
  const touchActivatePositionRef = useRef<{
    locationX: number;
    locationY: number;
  } | null>(null);
  const mapRef = ref || backupRef;

  const [mapContainerMeasurements, setMapContainerMeasurements] = useState<null | {
    width: number;
    height: number;
    longitudeDelta: number;
    southWest: { latitude: number; longitude: number };
  }>(null);

  const measureMapPoints = useCallback(
    async (event?: NativeSyntheticEvent<{}>) => {
      const { northEast, southWest } = await mapRef.current?.getMapBoundaries();
      const longitudeDelta = northEast.longitude - southWest.longitude;

      mapContainerRef.current?.measure((_x, _y, w, h) => {
        setMapContainerMeasurements({
          width: w,
          height: h,
          longitudeDelta,
          southWest,
        });
      });
      onMapReady?.(event);
    },
    [mapRef, onMapReady],
  );

  const markerPositions: MarkerPosition[] = useMemo(() => {
    if (!mapContainerMeasurements || !markerLocations?.length) {
      return [];
    }
    let coord;
    const { width: mapWidth, height: mapHeight, southWest, longitudeDelta } = mapContainerMeasurements;
    return markerLocations.map((loc, index) => {
      coord = convertGeoToPixel(
        loc.latitude,
        loc.longitude,
        mapWidth,
        mapHeight,
        southWest.longitude,
        longitudeDelta,
        southWest.latitude,
        (southWest.latitude * Math.PI) / 180,
      );

      return {
        left: coord.x - loc.width / 2,
        right: coord.x + loc.width / 2,
        top: coord.y - loc.height,
        bottom: coord.y,
        zIndex: loc.zIndex || index,
        item: loc.item,
      };
    });
  }, [mapContainerMeasurements, markerLocations]);

  const handleRegionChangeComplete = useCallback(
    (region: Region, details: Details) => {
      measureMapPoints();
      onRegionChangeComplete?.(region, details);
    },
    [measureMapPoints, onRegionChangeComplete],
  );

  const handlePressIn = useCallback((e: GestureResponderEvent) => {
    const { locationX, locationY } = e.nativeEvent;

    touchActivatePositionRef.current = {
      locationX,
      locationY,
    };
  }, []);

  const handlePress = useCallback(
    (e: GestureResponderEvent) => {
      const { locationX, locationY } = e.nativeEvent;
      const absX = Math.abs(touchActivatePositionRef.current!.locationX - locationX);
      const absY = Math.abs(touchActivatePositionRef.current!.locationY - locationY);
      const dragged = absX > 2 || absY > 2;
      if (!dragged) {
        let curr: MarkerPosition;
        let found: { position: typeof curr; index: number } | null = null;
        for (let i = markerPositions.length - 1; i >= 0; i--) {
          curr = markerPositions[i];
          if (
            curr.left <= locationX &&
            curr.right >= locationX &&
            curr.top <= locationY &&
            curr.bottom >= locationY &&
            (!found || curr.zIndex >= found?.position.zIndex)
          ) {
            found = { position: curr, index: i };
          }
        }
        onTouch?.(found?.position.item, found?.index);
      }
    },
    [markerPositions, onTouch],
  );

  return (
    <Pressable ref={mapContainerRef} style={style} onPressIn={handlePressIn} onPress={handlePress}>
      <RnMapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        onMapReady={measureMapPoints}
        onRegionChangeComplete={handleRegionChangeComplete}
        provider="google"
        {...props}>
        {children}
      </RnMapView>
    </Pressable>
  );
};

export default forwardRef(MapView);

const convertGeoToPixel = (
  latitude: number,
  longitude: number,
  mapWidth: number, // in pixels
  mapHeight: number, // in pixels
  mapLonLeft: number, // in degrees
  mapLonDelta: number, // in degrees (mapLonRight - mapLonLeft);
  mapLatBottom: number, // in degrees
  mapLatBottomDegree: number,
) => {
  // in Radians
  const x = (longitude - mapLonLeft) * (mapWidth / mapLonDelta);

  latitude = (latitude * Math.PI) / 180;
  const worldMapWidth = ((mapWidth / mapLonDelta) * 360) / (2 * Math.PI);
  const mapOffsetY =
    (worldMapWidth / 2) * Math.log((1 + Math.sin(mapLatBottomDegree)) / (1 - Math.sin(mapLatBottomDegree)));
  const y =
    mapHeight -
    ((worldMapWidth / 2) * Math.log((1 + Math.sin(latitude)) / (1 - Math.sin(latitude))) - mapOffsetY);

  return { x, y };
};
