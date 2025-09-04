import { useEffect, useState } from "react";
import { Magnetometer } from "expo-sensors";
import { Image, StyleSheet, View, TouchableOpacity } from "react-native";
import { request, PERMISSIONS, RESULTS } from "react-native-permissions";
import {
  isLocationEnabled,
  promptForEnableLocationIfNeeded,
} from "react-native-android-location-enabler";
import { MaterialIcons } from "@expo/vector-icons";
import { Camera, MapView, MarkerView } from "@maplibre/maplibre-react-native";
import Geolocation, {
  GeolocationError,
  GeolocationResponse,
} from "@react-native-community/geolocation";

export default function Map() {
  const [location, setLocation] = useState<any>({
    latitude: 55.6761,
    longitude: 12.5683,
  });
  const [locationPermission, setLocationPermission] = useState(false);
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [headingDirection, setHeadingDirection] = useState<number | null>(null);

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

  // TODO watch location enabled, if not unsuscribe
  // Remove subscription when leaving the map view
  // If the magnetometer its not available show default icon and not the tractor one
  // When this is working the camera gets crazy and zooms into the tractor all the time
  const setMagnetometer = async () => {
    if (!locationPermission || !locationEnabled) return;
    if (!(await Magnetometer.isAvailableAsync())) return;
    if (!(await Magnetometer.getPermissionsAsync()).granted) return;

    Magnetometer.setUpdateInterval(500);

    Magnetometer.addListener((result) => {
      let angle = Math.atan2(result.y, result.x) * (180 / Math.PI);
      // Normalize the angle to be between 0 and 360
      if (angle < 0) angle += 360;

      setHeadingDirection(angle);
    });
  };

  const watchUserLocation = () => {
    if (!locationPermission || !locationEnabled) return;

    Geolocation.watchPosition(setCurrentLocation, locationErrorCallback, {
      distanceFilter: 10,
      enableHighAccuracy: false,
    });
  };

  const getLocation = async () => {
    const requestLocationResponse = await request(
      PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
    );
    setLocationPermission(requestLocationResponse === RESULTS.GRANTED);
    setLocationEnabled(await isLocationEnabled());

    if (locationPermission && locationEnabled) fetchLocation();
  };

  useEffect(() => {
    getLocation();
    // watchUserLocation();
    // setMagnetometer();
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <MapView
        style={{ flex: 1 }}
        mapStyle="https://api.maptiler.com/maps/basic-v2/style.json?key=PMK5ywsC29zKMVfrB4U4"
      >
        {/* https://maplibre.org/maplibre-react-native/docs/components/general/camera
        Try camera settings and see how they look */}
        <Camera
          centerCoordinate={[location.longitude, location.latitude]}
          zoomLevel={15}
        />
        {/* <MarkerView coordinate={[location.longitude, location.latitude]}>
          <Image
            source={require("@/assets/icons/tractor.png")}
            style={[
              styles.tractorIcon,
              {
                transform:
                  headingDirection !== null
                    ? [{ rotate: `${headingDirection}deg` }]
                    : [],
              },
            ]}
          />
        </MarkerView> */}
      </MapView>
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
