import React from 'react';
import { MapViewProps as RnMapViewProps } from 'react-native-maps';

export type MarkerLocation = {
  latitude: number;
  longitude: number;
  width: number;
  height: number;
  zIndex?: number;
  item?: any;
};

export type MapViewProps = {
  markerLocations: MarkerLocation[];
  onTouch?: (item?: any, index?: number) => void;
} & RnMapViewProps;

export declare const MapView: React.FC<MapViewProps>;
