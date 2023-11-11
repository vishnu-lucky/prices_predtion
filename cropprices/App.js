import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Text, Image, StyleSheet, TextInput, FlatList } from 'react-native';
import Loader from './Loader';

const cropImages = {
  carrot: require('./crop/carrot.jpeg'),
  tomato: require('./crop/tomato.jpeg'),
  cucuber: require('./crop/cucumber.jpeg'),
  rice: require('./crop/wheat.jpeg'),
  onion: require('./crop/oni.jpeg'),
  green_chili: require('./crop/greenchile.jpeg'),
  lemon: require('./crop/th.jpeg'),
  brinjal: require('./crop/ginger.jpeg'),
  drums: require('./crop/drums.jpeg'),
  cabage: require('./crop/cabage.jpeg'),
  banana: require('./crop/banana.jpeg'),
  tobaco: require('./crop/tobaco.jpeg'),
  spainch: require('./crop/spainch.jpeg'),
  redchile: require('./crop/redchil.jpeg'),
  pumkin: require('./crop/pumkin.jpeg'),
  potato: require('./crop/potato.jpeg'),
  mango: require('./crop/mango.jpeg'),
  ladies_fin: require('./crop/ladies.jpeg'),
  ground_nut: require('./crop/groundnuts.jpeg'),
};

const cropNames = Object.keys(cropImages);

const App = () => {
  const [currentScreen, setCurrentScreen] = useState('CropList');
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [predictedPrice, setPredictedPrice] = useState(null);
  const [presentPrice, setPresentPrice] = useState(null);

  const defaultYear = new Date().getFullYear();
  const defaultMonth = new Date().getMonth() + 1;
  const defaultRainfall = 100;
  const defaultYields = 1450;

  const handleCropSelection = async (cropName) => {
    setSelectedCrop(cropName);

    try {
      const response = await fetch('http://192.168.238.59:5000/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          year: defaultYear,
          month: defaultMonth + 6,
          rainfall: defaultRainfall,
          yields: defaultYields,
          cp: cropName,
        }),
      });

      if (response.status === 200) {
        const data = await response.json();
        setPredictedPrice(data.prediction);

        try {
          const presentPriceResponse = await fetch(
            'http://192.168.238.59:5000/get_present_price',
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                cp: cropName,
              }),
            }
          );

          if (presentPriceResponse.status === 200) {
            const presentPriceData = await presentPriceResponse.json();
            setPresentPrice(presentPriceData.presentPrice);
          } else {
            console.error('Error fetching present price:', presentPriceResponse.statusText);
          }
        } catch (error) {
          console.error('Error fetching present price:', error);
        }

        setCurrentScreen('CropDetail');
      } else {
        console.error('Error predicting crop price:', response.statusText);
      }
    } catch (error) {
      console.error('Error predicting crop price:', error);
    }
  };

  const handleGoBack = () => {
    setCurrentScreen('CropList');
    setSelectedCrop(null);
    setIsLoading(false);
  };

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 3000);
  }, []);

  return (
    <View style={styles.container}>
      {currentScreen === 'CropList' ? (
        <CropListScreen onSelectCrop={handleCropSelection} isLoading={isLoading} />
      ) : currentScreen === 'CropDetail' ? (
        <CropDetailScreen
          cropName={selectedCrop}
          predictedPrice={predictedPrice}
          presentPrice={presentPrice}
          onGoBack={handleGoBack}
        />
      ) : null}
    </View>
  );
};

const CropListScreen = ({ onSelectCrop, isLoading }) => {
  const [searchText, setSearchText] = useState('');
  const [filteredCrops, setFilteredCrops] = useState(cropNames);

  useEffect(() => {
    const filtered = cropNames.filter((cropName) =>
      cropName.toLowerCase().includes(searchText.toLowerCase())
    );
    setFilteredCrops(filtered);
  }, [searchText]);

  return (
    <View style={styles.container}>
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <TextInput
            style={styles.searchInput}
            placeholder="🔍 Search Crops"
            onChangeText={(text) => setSearchText(text)}
            value={searchText}
          />

          <FlatList
            data={filteredCrops}
            numColumns={3}
            renderItem={({ item }) => <IconButton cropName={item} onPress={onSelectCrop} />}
            keyExtractor={(item) => item}
          />
        </>
      )}
    </View>
  );
};

const CropDetailScreen = ({ cropName, predictedPrice, presentPrice, onGoBack }) => {
  const isPredictedPriceLess = predictedPrice < presentPrice;
  const arrowColor = isPredictedPriceLess ? 'red' : 'green';
  const arrowText = isPredictedPriceLess ? '▼' : '▲';

  return (
    <View style={styles.container}>
      <Text style={styles.cropNames}>{cropName} details</Text>
      <Image source={cropImages[cropName]} style={styles.cropImageDetail} />
      <Text style={styles.sideHeading}>Present Price:</Text>
      <View style={styles.priceContainer}>
        <Text style={styles.priceValue}>{presentPrice}</Text>
        {/* <Text style={[styles.arrow, { color: arrowColor }]}>{arrowText}</Text> */}
      </View>
      <Text style={styles.upcomingPriceText}>Predicted Price:</Text>
      <View style={styles.priceContainer}>
        <Text style={styles.priceValue}>{predictedPrice.toFixed(2)}</Text>
        <Text style={[styles.arrow, { color: arrowColor }]}>{arrowText}</Text>
      </View>
      <TouchableOpacity style={styles.backButton} onPress={onGoBack}>
        <Text style={styles.backButtonText}>Go Back</Text>
      </TouchableOpacity>
    </View>
  );
};

const IconButton = ({ cropName, onPress }) => (
  <TouchableOpacity style={styles.button} onPress={() => onPress(cropName)}>
    <Image source={cropImages[cropName]} style={styles.cropImage} />
    <Text style={styles.cropName}>{cropName}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f0f0f0',
  },
  button: {
    width: '30%',
    aspectRatio: 1,
    backgroundColor: 'white',
    borderRadius: 8,
    margin: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    elevation: 3,
    shadowColor: 'rgba(0, 0, 0, 0.3)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
  },
  cropImage: {
    width: 95,
    height: 80,
    borderRadius: 8,
  },
  cropImageDetail: {
    width: 95,
    height: 80,
    borderRadius: 8,
    alignItems: 'center',
    transform: [{ translateX: 100 }],
  },
  sideHeading: {
    fontSize: 24,
    fontWeight: 'bold',
    transform: [{ translateX: 10 }],
    marginTop: 20,
  },
  upcomingPriceText: {
    fontSize: 24,
    fontWeight: 'bold',
    transform: [{ translateX: 10 }],
    marginTop: 20,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    transform: [{ translateX: 10 }],
    marginTop: 5,
  },
  priceValue: {
    fontSize: 40,
    color: 'black',
  },
  arrow: {
    fontSize: 40,
    fontWeight: 'bold',
  },
  cropName: {
    marginTop: 2,
    fontSize: 10,
    fontWeight: 'bold',
    color: 'black',
  },
  cropNames: {
    marginTop: 2,
    fontSize: 30,
    fontWeight: 'bold',
    color: 'black',
    fontFamily: 'sans-serif',
  },
  searchInput: {
    borderRadius: 8,
    padding: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  backButton: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 10,
    borderColor: '#ccc',
    borderWidth: 1,
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
  },
});

export default App;
