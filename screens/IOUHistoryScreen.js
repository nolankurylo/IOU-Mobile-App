import React from 'react';
import {
    Text,
    TouchableOpacity,
    FlatList,
    View,
    StyleSheet,
    ScrollView,
    Alert,
    Image
  } from "react-native";
  import {
    Card,
    ListItem,
  } from "react-native-elements";
import { API_ROUTE } from "react-native-dotenv";
import CustomizedIcon from "../components/CustomizedIcon"
import Loader from "../components/Loader"

export default class IOUHistoryScreen extends React.Component {
  static navigationOptions = ({navigation}) => {
    if (navigation.getParam("total_amount") === undefined){
      return {
        headerLeft: null,
        headerTitle: <Loader loading={true} color={"#000000"} /> 
      }
    }
    amount = navigation.getParam("total_amount").toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})
    // Current user owes other user x dollars
    if(parseFloat(navigation.getParam("total_amount")) > 0){
      return {
        headerLeft: null,
        headerTitle: <Text style={{fontSize: 20, fontWeight:'bold', color:"#F51717" , textAlign: 'center'}}>
        You Owe {navigation.getParam("other_user").name} ${amount}</Text>,
        headerRight: navigation.getParam("isFriend") ? null : <TouchableOpacity onPress={() => navigation.getParam("addFriend")()} style={{ marginHorizontal: 10 }}><CustomizedIcon name="md-person-add" color="#3CB371" /></TouchableOpacity>
      }
    }
    // Two users are even
    else if (parseFloat(navigation.getParam("total_amount")) == 0){
      return {
        headerLeft: null,
        headerTitle: <Text style={{fontSize: 20, fontWeight:'bold', color:"#3CB371" , textAlign: 'center'}}>
        No Money IOU's</Text>,
        headerRight: navigation.getParam("isFriend") ? null : <TouchableOpacity onPress={() => navigation.getParam("addFriend")()} style={{ marginHorizontal: 10 }}><CustomizedIcon name="md-person-add" color="#3CB371" /></TouchableOpacity>
      }
    }
    // Other user owes current user x dollars
    else{
      var amount = (navigation.getParam("total_amount") * -1).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})
      return {
        headerLeft: null,
        headerTitle: <Text style={{fontSize: 20, fontWeight:'bold', color:"#3CB371" , textAlign: 'center'}}> 
        {navigation.getParam("other_user").name} Owes You ${amount}</Text>,
        headerRight: navigation.getParam("isFriend") ? null : <TouchableOpacity onPress={() => navigation.getParam("addFriend")()} style={{marginHorizontal: 10}}><CustomizedIcon name="md-person-add" color="#3CB371" /></TouchableOpacity>
      }
    } 
  };

  constructor(props) {
    super(props);
    this.state = {
      itemHistory: [],
      moneyHistory: [],
      user: "",
      house_id: "",
      user_amount: 0,
      user_items: 0,
      other_user_amount: 0,
      other_user_items: 0, 
      other_user: "",
      total_amount: 0,
    }
  } 

  componentWillMount = () => {
    this.state.user = this.props.navigation.getParam('user');
    this.state.other_user = this.props.navigation.getParam('other_user');
    this.state.house_id = this.props.navigation.getParam('house_id');
    this.getHistory();
  }

  renderButtons = () => {
    // Current user owes other user x dollars
    amount = 0;
    if (this.state.total_amount > 0){
      amount = (this.state.total_amount).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}); 
      return (
        <View style={{ flex: 1, justifyContent: 'center',alignItems: 'center', flexWrap: 'wrap'}}>
          <TouchableOpacity onPress={() => this.finalizeAllMoneySubmission()} style={styles.btn}>
            <Text style={{flex: 1, color:"#FFF", fontWeight: 'bold', fontSize: 15, textAlign: "center", flexWrap: "wrap"}} >Pay ${amount} To {this.state.other_user.name}</Text>        
          </TouchableOpacity>
        </View>
      )
    }
    // Other user owes current user x dollars
    else if (this.state.total_amount < 0){
      amount = (this.state.total_amount * -1).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}); 
      return (
        <View style={{ flex: 1, justifyContent: 'center',alignItems: 'center'}}>
          <TouchableOpacity onPress={() => this.finalizeAllMoneySubmission()} style={styles.btn}>
            <Text style={{flex: 1, color:"#FFF", fontWeight: 'bold', fontSize: 15, textAlign:"center", flexWrap: "wrap" }}>Pay Yourself ${amount} Back For {this.state.other_user.name}</Text>        
          </TouchableOpacity>
        </View>
      )
    }
    // Two users are even
    else {
      return null
    } 
  }

  renderMoneyTitle = item => {
    // Current user owes other user x dollars
    if (item.you_owe){
        return (
          <Text adjustsFontSizeToFit style={{ fontWeight: "bold", fontSize: 13, color: '#FF5733'}}>
            You owe: ${parseFloat(item.amount).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
          </Text>
        );
      } 
    // Other user owes current user x dollars
    else {
      return (
        <Text adjustsFontSizeToFit style={{ fontWeight: "bold", fontSize: 13, color: "#3CB371" }}>
          They owe: ${parseFloat(item.amount).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
        </Text>
      )
    } 
  }

  renderItemTitle = item => {
    // Current user owes this item to other user
    if (item.you_owe){
        return (
          <Text adjustsFontSizeToFit style={{ fontWeight: "bold", fontSize: 13, color: '#FF5733' }}>
            You owe:
          </Text>
        );
      } 
    // Other user owes this user this item
    else {
      return (
        <Text adjustsFontSizeToFit style={{ fontWeight: "bold", fontSize: 13, color: "#3CB371" }}>
        They owe:
        </Text>
      )
    } 
  }

  renderItemRight = item => {
    return (
      <TouchableOpacity onPress={() => this.finalizeIOU(item)} style={styles.reimburse}><Image style={{width: 30, height: 30}}
      source={require('../assets/images/handshake1.png')}
    /></TouchableOpacity>
    )
  }

  renderSeparator = () => {
    return (
      <View
        style={{
          height: 1,
          width: "100%",
          backgroundColor: "#CED0CE"
        }}
      />
    );
  };

  render() {
    return (
      <View style={{flex: 1, backgroundColor:"#3498db"}}>
        <ScrollView >
          <View style={{marginHorizontal: 5, marginTop: 15}}>
            {this.renderButtons()}
            <Card title={"IOU's between you and " + this.state.other_user.name}>
            <View style={{flexDirection: "row"}}>
              <FlatList
                style={{width: "100%"}}
                ListHeaderComponent={<View style={{borderBottomWidth: 1, borderBottomColor: '#CED0CE', alignItems: "center"}}><Text style={{fontWeight: "bold", color: "#3CB371"}}>MONEY</Text><View style={{marginBottom: 10}}>
                <CustomizedIcon name="logo-usd" color="#3CB371"/></View></View>}
                ItemSeparatorComponent={this.renderSeparator}
                ListEmptyComponent={<Text style={{textAlign: "center", marginVertical: "9%", fontWeight: "bold", fontSize: 13}}>No Money IOU's</Text>}
                extraData={this.state}
                data={this.state.moneyHistory}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item, index }) => <ListItem
                style={styles.listItem}
                subtitle={<Text><Text style={{fontWeight:'bold'}}>For: </Text>{item.description}</Text>}
                subtitleStyle={{width: "90%", fontSize: 13}}
                title={this.renderMoneyTitle(item)}
                titleStyle={{width: 230, fontSize: 13}}
                />}
              />
              <View style={{ borderLeftWidth: 1, height: '100%', borderLeftColor: '#CED0CE' }}/>
              <FlatList
                style={{width: "100%"}}
                ListHeaderComponent={<View style={{borderBottomWidth: 1, borderBottomColor: '#CED0CE', alignItems: "center"}}><Text style={{fontWeight: "bold", color: "#0589D0"}}>ITEMS</Text><View style={{marginBottom: 10, flexDirection: "row"}}>
                <CustomizedIcon style={{marginHorizontal: 50}} name="ios-beer" color="#DBD50A"/><CustomizedIcon name="md-pizza" color="#FF5733"/><CustomizedIcon name="ios-cube" color="#0589D0"/></View></View>}
                ItemSeparatorComponent={this.renderSeparator}
                extraData={this.state}
                data={this.state.itemHistory}
                ListEmptyComponent={<Text style={{textAlign: "center", marginVertical: "9%", fontWeight: "bold", fontSize: 13}}>No Item IOU's</Text>}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item, index }) => <ListItem
                style={styles.listItem}
                subtitle={item.item}
                subtitleStyle={{width: '80%', fontSize: 13}}
                title={this.renderItemTitle(item)}
                titleStyle={{width: 50, fontSize: 13}}
                rightElement={() => this.renderItemRight(item)}
                />}
              />
              </View>
            </Card>
            
          </View>
        </ScrollView>
        <TouchableOpacity style={styles.continueBtn} onPress={() => this.props.navigation.goBack()} >
              <Text style={{color:"#FFFFFF", fontWeight: 'bold', fontSize: 18, textAlign: 'center'}}>Done</Text>        
            </TouchableOpacity>
        </View>
    );
  }

  getHistory= () => {
    // Request API to get all unsettled money/item IOUs with their information
    url = API_ROUTE + "/get_history/" + this.state.user + "/" + this.state.other_user.id + "/" + this.state.house_id
    fetch(url, {
      method: 'GET'
    })
    .then(response => response.json())
    .then(res => {
      moneyHistory = []
      itemHistory = []
      var user_amount = 0;
      var user_items = 0;
      var other_user_amount = 0;
      var other_user_items = 0;
      for (var i = 0; i < res.history.length; i++){
        // This is what the other user owes the current user
        if(res.history[i].user_id == this.state.user){
          if(res.history[i].amount){
            moneyHistory.push({ id: res.history[i].id, you_owe: false, amount: res.history[i].amount, description: res.history[i].description})
            other_user_amount += parseFloat(res.history[i].amount);
          }
          else{
            itemHistory.push({ id: res.history[i].id, you_owe: false, item: res.history[i].object})
            other_user_items += 1
          }
        }
        // This is what the current user owes the other user
        else{
          if(res.history[i].amount){
            moneyHistory.push({ id: res.history[i].id, you_owe: true, amount: res.history[i].amount, description: res.history[i].description})
            user_amount += parseFloat(res.history[i].amount);
          }
          else{
            itemHistory.push({ id: res.history[i].id, you_owe: true, item: res.history[i].object})
            user_items += 1
          }
        }
      }
      // Total owed amount
      total_amount = user_amount - other_user_amount
      // Set arrays and amounts for screen rendering
      this.setState({ moneyHistory: moneyHistory, itemHistory: itemHistory, total_amount: total_amount });
      // Set total amount/option to add this user as a friend for Header Nav Bar
      this.props.navigation.setParams({
        total_amount: total_amount, 
        isFriend: res.isFriend ? true : false,
        addFriend: this.addFriend
      })
      
    })
    .catch(error => console.log(error));
  }

  addFriend = () => {
    // Option to add this user as a friend if not already friends
    // Request API to add this user as a friend, skipping friend request to directly add them
    url = API_ROUTE + "/add_friend"
    fetch(url, {
      method: 'POST',
      body: JSON.stringify({ user_id: this.state.user, other_user: this.state.other_user.id}),
      headers: { "Content-Type": "application/json" }
    })
      .then(response => response.json())
      .then(res => {
        if (res.success){
          this.getHistory();
          return Alert.alert(
            'Friend Added',
            'You are now friends with ' + this.state.other_user.name,
            [
              {
                text: 'Okay',
                style: 'cancel',
              },
            ],
            {cancelable: false},
          );
        }
      })
      .catch(error => {
        console.log(error)
      })
  }

  finalizeIOU = item => {
    if(item.you_owe){
      return Alert.alert(
        'Just Double Checking',
        'Do you wish to finalize this IOU that you owe ' + this.state.other_user.name + '?',
        [
          {
            text: 'No',
          },
          {
            text: 'Yes',
            onPress: () => this.settleObjectIOU(item)
          },
        ],
        {cancelable: false},
      );
    }
    else{
      return Alert.alert(
        'Just Double Checking',
        'Do you wish to finalize this IOU that ' + this.state.other_user.name + ' owes you?',
        [
          {
            text: 'No',
          },
          {
            text: 'Yes',
            onPress: () => this.settleObjectIOU(item)
          },
        ],
        {cancelable: false},
      );
    }
  }

  finalizeAllMoneySubmission = () => {
      return Alert.alert(
        'Just Double Checking',
        'Do you wish to finalize the money IOU?',
        [
          {
            text: 'No',
          },
          {
            text: 'Yes',
            onPress: () => this.settleMoneyIOU()
          },
        ],
        {cancelable: false},
      );
  }

  settleObjectIOU = item => {
    // Request API to settle this individual item/object IOU
    url = API_ROUTE + "/settle_object_iou"
    fetch(url, {
      method: 'POST',
      body: JSON.stringify({ user_id: this.state.user, other_user: this.state.other_user.id, house_id: this.state.house_id,  id: item.id}),
      headers: { "Content-Type": "application/json" }
    })
      .then(response => response.json())
      .then(res => {
        if (res.success){
          this.getHistory();
          return Alert.alert(
            'IOU Concluded!',
            'You successfully resolved an item with ' + this.state.other_user.name,
            [
              {
                text: 'Okay',
                style: 'cancel',
              },
            ],
            {cancelable: false},
          );
        }
      })
      .catch(error => {
        console.log(error)
      })
  }

  settleMoneyIOU = () => {
    // Request API to settle total money owed between these two users
    url = API_ROUTE + "/settle_money_iou"
    fetch(url, {
      method: 'POST',
      body: JSON.stringify({ user_id: this.state.user, other_user: this.state.other_user.id, house_id: this.state.house_id}),
      headers: { "Content-Type": "application/json" }
    })
      .then(response => response.json())
      .then(res => {
        if (res.success){
          this.getHistory();
          return Alert.alert(
            'IOU Concluded!',
            'You successfully resolved all funds with ' + this.state.other_user.name + '!',
            [
              {
                text: 'Okay',
                style: 'cancel',
              },
            ],
            {cancelable: false},
          );
        }
      })
      .catch(error => {
        return console.log(error)
      })
  }
}

const styles = StyleSheet.create({
    textInput: {
      padding: 20,
      backgroundColor: "#FFF",
      borderRadius: 10,
      borderWidth: 1,
      borderColor: "grey" 
    },
    reimburse: {
      flex: 1, 
      width:35, 
      height: 35,
      position: 'absolute',
      right: 0,
      backgroundColor: '#D6D6D6', 
      borderRadius: 5, 
      alignItems: 'center', 
      justifyContent: 'center',
      marginLeft: 5
    },
    btn: {
      width: "60%",
      marginVertical: 15,
      backgroundColor: "#FF5733",
      padding: 5,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 8 ,
      flexDirection: "row"
    },
    continueBtn: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      marginTop: 30,
      marginHorizontal: 30,
      marginBottom: 15,
      backgroundColor: "#3CB371",
      padding: 16,
      alignItems: "stretch",
      borderRadius: 8
    }
  });
