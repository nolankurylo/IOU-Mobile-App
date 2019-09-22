import React from 'react';
import {
  StyleSheet,
  ActivityIndicator
} from 'react-native';
const Loader = props => {
  const {
    color
  } = props;
return (
      <ActivityIndicator  style={styles.loader} animating={true} size="large" color={color}/>
  )
}
const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignSelf: 'center',
    },
    loader: { 
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,  
    }
  });
export default Loader;