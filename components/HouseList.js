import React from 'react';
import {
    Text,
    View,
    StyleSheet
  } from "react-native";
import CustomizedIcon from "../components/CustomizedIcon"

export default class HouseList extends React.Component {
  constructor(props) {
    super(props);
  }  

  render() {
    var amount =  parseFloat(this.props.amount)
    var numItems = this.props.numItems
    var s = 's';
    if (numItems == 1){
        s = null
    }
    if (amount > 0){
      amount = amount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})
      if(numItems != 0){
        return (
          <View style={styles.contentGreen}>
            <View style={{flex: 1, flexDirection: 'column'}}>
              <Text style={styles.amount}>You Are Owed</Text>
              <Text style={styles.amount}>${amount} With {numItems} Item{s}</Text>
            </View>
            <CustomizedIcon name="ios-arrow-forward" color="#3498db" size={40}/>
          </View>
        )
      }
      else {
        return (
          <View style={styles.contentGreen}>
            <View style={{flex: 1, flexDirection: 'column'}}>
              <Text style={styles.amount}>You Are Owed</Text>
            <Text style={styles.amount}>${amount}</Text>
            </View>
            
            <CustomizedIcon name="ios-arrow-forward" color="#3498db" size={40}/>
          </View>
        )
      }
    }
    else if (amount == 0 ){
      amount = amount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})
      if(numItems != 0){
        return (
          <View style={styles.contentGrey}>
            <View style={{flex: 1, flexDirection: 'column'}}>
              <Text style={styles.amount}>{numItems} Item{s}</Text>
            </View>
            <CustomizedIcon name="ios-arrow-forward" color="#3498db" size={40}/>
          </View>
        )
      }
      else{
        return (
          <View style={styles.contentGrey}>
            <View style={{flex: 1, flexDirection: 'column'}}>
              <Text style={styles.amount}>You Are Even</Text>
            </View>
            <CustomizedIcon name="ios-arrow-forward" color="#3498db" size={40}/>
          </View>
        )
      }
    }
    else{
      amount = parseFloat(this.props.amount * -1).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})
      if(numItems != 0){
        return (
          <View style={styles.contentRed}>
            <View style={{flex: 1, flexDirection: 'column'}}>
              <Text style={styles.amount}>You Owe ${amount}</Text>
              <Text style={styles.amount}>With {numItems} Item{s}</Text>
            </View>
            <CustomizedIcon name="ios-arrow-forward" color="#3498db" size={40}/>
          </View>
        )
      }
      else {
        return (
          <View style={styles.contentRed}>
            <View style={{flex: 1, flexDirection: 'column'}}>
              <Text style={styles.amount}>You Owe</Text>
              <Text style={styles.amount}>${amount}</Text>
            </View>
            <CustomizedIcon name="ios-arrow-forward" color="#3498db" size={40}/>
          </View>
        )
      }
    }
  }
}

const styles = StyleSheet.create({
    amount: {
        color: "#FFF",
        fontSize: 17,
        fontWeight: 'bold',
        textAlign: 'center'
      },
      contentGreen: {
        flex: 1, 
        flexDirection: 'row', 
        height: 80, 
        backgroundColor: '#3CB371', 
        borderRadius: 5, 
        alignItems: 'center', 
        justifyContent: 'center', 
        padding: 10
      },
      contentRed: {
        flex: 1,
        flexDirection: 'row',
        height: 80,
        backgroundColor: '#FFC300',
        borderRadius: 5,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 10
      },
      contentGrey: {
        flex: 1,
        flexDirection: 'row',
        height: 80,
        backgroundColor: '#ACACAC',
        borderRadius: 5,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 10
      }
  });