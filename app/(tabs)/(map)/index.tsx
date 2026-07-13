import {
  Camera,
  Map as MapLibre,
  Marker,
} from "@maplibre/maplibre-react-native";
import { useEffect, useState } from "react";
import { Image, StyleSheet, View, TouchableOpacity } from "react-native";
import Geolocation, {
  GeolocationError,
  GeolocationResponse,
} from "@react-native-community/geolocation";
import { MaterialIcons } from "@expo/vector-icons";
import { request, PERMISSIONS, RESULTS } from "react-native-permissions";
import {
  isLocationEnabled,
  promptForEnableLocationIfNeeded,
} from "react-native-android-location-enabler";

export default function Map() {
  const [location, setLocation] = useState<any>({
    latitude: 55.6761,
    longitude: 12.5683,
  });
  const [locationPermission, setLocationPermission] = useState(false);
  const [locationEnabled, setLocationEnabled] = useState(false);

  const setCurrentLocation = (position: GeolocationResponse) => {
    const { latitude, longitude } = position.coords;
    setLocation({ latitude, longitude });
  };

  const locationErrorCallback = (error: GeolocationError) => {
    if (error.POSITION_UNAVAILABLE === error.code) setLocationEnabled(false);
  };

  const fetchLocation = async () => {
    Geolocation.getCurrentPosition(setCurrentLocation, locationErrorCallback, {
      enableHighAccuracy: false,
      timeout: 15000,
      maximumAge: 0,
    });
  };

  const getCurrentLocationClick = async () => {
    if (locationEnabled) fetchLocation();
    else {
      try {
        await promptForEnableLocationIfNeeded();
        setLocationEnabled(true);
        fetchLocation();
      } catch (error: unknown) {
        if (error instanceof Error) {
          setLocationEnabled(false);
        }
      }
    }
  };

  useEffect(() => {
    const onMounted = async () => {
      const requestLocationResponse = await request(
        PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
      );
      setLocationPermission(requestLocationResponse === RESULTS.GRANTED);
      setLocationEnabled(await isLocationEnabled());

      if (locationPermission && locationEnabled) fetchLocation();
    };

    const watchUserLocation = () => {
      Geolocation.watchPosition(setCurrentLocation, locationErrorCallback, {
        distanceFilter: 10,
        enableHighAccuracy: false,
      });
    };

    onMounted();
    watchUserLocation();
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <MapLibre
        style={{ flex: 1 }}
        mapStyle="https://api.maptiler.com/maps/basic-v2/style.json?key=PMK5ywsC29zKMVfrB4U4"
      >
        <Camera
          initialViewState={{
            center: [location.longitude, location.latitude],
            zoom: 15,
          }}
        />
        <Marker lngLat={[location.longitude, location.latitude]}>
          <Image
            source={require("@/assets/icons/tractor.png")}
            style={styles.tractorIcon}
          />
        </Marker>
      </MapLibre>
      <TouchableOpacity style={styles.button} onPress={getCurrentLocationClick}>
        <MaterialIcons
          name={locationEnabled ? "my-location" : "location-searching"}
          size={24}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  tractorIcon: {
    width: 30,
    height: 30,
    resizeMode: "contain",
  },
  button: {
    position: "absolute",
    bottom: 20,
    left: 20,
    backgroundColor: "#D3D3D3",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
});
