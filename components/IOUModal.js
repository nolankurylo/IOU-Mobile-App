import React from 'react';
import {
    Text,
    TouchableOpacity,
    FlatList,
    View,
    StyleSheet,
    ScrollView,
    TextInput,
    KeyboardAvoidingView,
    TouchableWithoutFeedback,
    Keyboard
  } from "react-native";
  import {
    Card,
    ListItem
  } from "react-native-elements";
import CustomizedIcon from "./CustomizedIcon"
import { API_ROUTE } from "react-native-dotenv";
import FlashMessage, { showMessage } from "react-native-flash-message";

export default class IOUModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      money: true,
      object: false,
      house: [],
      user: this.props.user,
      amount: 0,
      description: this.props.item,
      house_id: this.props.house_id,
      addedArray: [],
      numAdded: this.props.house.length + 1
    } 
  }

  componentDidMount = () =>{
    // Initialize added list with every user in this house set to true
    var house = []
    house.push({id: this.state.user, name: "You", add: true})
    for (var i = 0; i < this.props.house.length; i++){
      house.push({id: this.props.house[i].id, name: this.props.house[i].name, add: true})
    }
    this.setState({ house: house  });
  }

  renderTitle = item => {
    // Renders the individual list item titles for a money IOU and an item IOU
    var amount = (this.state.amount / this.state.numAdded).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
    if(this.state.money && item.add){
      return (
        <Text>{item.name} will owe ${amount}</Text>
      )
    }
    else {
      return (
        <Text>{item.name}</Text>
      )
    }
  }

  scroll = y => {
    // Scrolls to next textInput on press 
    this.scrollView.scrollTo({ x: 0, y: y, animated: true })
    return
  }

  renderInput = () => {
      if (this.state.money){
        return(
            <View>
              <Text style={styles.text}>This is for:</Text>
              <View style={{ flexDirection: "row" }}>
                <TextInput multiline maxLength={100} maxHeight={100} placeholder="Enter Item" value={this.state.description} style={styles.textInput} onChangeText={description => this.setState({ description })} />
                <View style={{flex: 0.15, marginLeft:10}}>
                <TouchableWithoutFeedback style={{ flex: 1 }} onPress={() => this.scroll(275)}>
                  <View>
                    <CustomizedIcon name="md-arrow-round-forward" color="#51B1D3" size={40} />
                  </View> 
                </TouchableWithoutFeedback> 
                </View>
              </View>
              <Text style={styles.text}>For how much?</Text>
              <View style={{ flexDirection: "row" }}>
                <TextInput multiline maxHeight={100} placeholder="Enter $ Amount" keyboardType="numeric" maxLength={5} style={styles.textInput} onChangeText={amount => this.setState({ amount })}/>
                <View style={{ flex: 0.15, marginLeft: 10 }}>
                  <TouchableWithoutFeedback style={{ flex: 1 }} onPress={Keyboard.dismiss}>
                    <View>
                      <CustomizedIcon name="md-arrow-round-forward" color="#51B1D3" size={40} />
                    </View>
                  </TouchableWithoutFeedback> 
                </View>
              </View>
             
            </View>
          )
      }
      else{
          return(
            <View style={{flex:1, textAlign: 'center'}}>
              <Text style={styles.text}>This is for:</Text>
              <View style={{ flexDirection: "row" }}>
                <TextInput maxHeight={100} multiline placeholder="Enter Item" maxLength={100} value={this.state.description} style={styles.textInput} onChangeText={description => this.setState({ description })} />
                <View style={{ flex: 0.15, marginLeft: 10 }}>
                  <TouchableWithoutFeedback style={{ flex: 1 }} onPress={Keyboard.dismiss}>
                    <View>
                      <CustomizedIcon name="md-arrow-round-forward" color="#51B1D3" size={40} />
                    </View>
                  </TouchableWithoutFeedback>
                </View>
              </View>
             
            </View>
        )
      }
  }
  
  updateAdd = (index) => {
    var updatedHouse = this.state.house;
    updatedHouse[index] = {
      "id": this.state.house[index]["id"],
      "name": this.state.house[index]["name"],
      "add": !this.state.house[index]["add"],
    }
    var numAdded = 0;
    for (var i = 0; i < house.length; i++){
      if(house[i].add){
        numAdded++
      }
    }
    if(this.state.addSelf){
      numAdded++
    }

    this.setState({ house: updatedHouse, numAdded: numAdded});
  } 
  
  render() {
    return (
      <View style={{flex: 1, backgroundColor:"#51B1D3"}}>
          <KeyboardAvoidingView behavior='padding' style = {{ flex: 1 }}>
          <ScrollView contentInset={{ top: 0, bottom: 100 }} ref={scrollView => this.scrollView = scrollView} keyboardShouldPersistTaps="handled">
            <View style={{marginTop:25, marginBottom:5, marginHorizontal:5}}>
              <Card title="Pick your type of IOU">
                  <View style={{flexDirection: "row", justifyContent: 'space-between', alignItems: "center", marginBottom: 10}}>
                    <View style={{justifyContent: "center", alignItems: "center"}}>
                      <Text style={{fontSize:16, fontWeight: 'bold', marginBottom: 10}}>Money IOU</Text>
                      <TouchableOpacity onPress={() => this.setState({ money: !this.state.money, object: !this.state.object })}
                      style={{
                      borderWidth:2,
                      borderColor: this.state.money ? "green" : "grey",
                      alignItems:'center',
                      justifyContent:'center',
                      width:30,
                      height:30,
                      backgroundColor:'#fff',
                      borderRadius:50}}
                      backgroundColor="#03A9F4" buttonStyle={{ alignItems: "right", borderRadius: 0, marginLeft: 0, marginRight: 0, marginBottom: 0}}>
                      <CustomizedIcon name="md-checkmark" color={this.state.money ? "green" : "white"}/>
                      </TouchableOpacity>
                    </View>
                    <CustomizedIcon name="md-contacts" color="#51B1D3" size={85}/>
                    <View style={{justifyContent: "center", alignItems: "center"}}>
                      <Text style={{fontSize:16, fontWeight: 'bold', marginBottom: 10}}>Item IOU</Text>
                      <TouchableOpacity onPress={() => this.setState({ object: !this.state.object, money: !this.state.money})} 
                      style={{
                      borderWidth:2,
                      borderColor: this.state.object ? "green" : "grey",
                      alignItems:'center',
                      justifyContent:'center',
                      width:30,
                      height:30,
                      backgroundColor:'#fff',
                      borderRadius:50}}
                      backgroundColor="#03A9F4" buttonStyle={{ alignItems: "right", borderRadius: 0, marginLeft: 0, marginRight: 0, marginBottom: 0}}>
                      <CustomizedIcon name="md-checkmark" color={this.state.object ? "green" : "white"}/>
                      </TouchableOpacity>
                    </View>
                  </View>
                  {this.renderInput()}
              </Card>
            </View>
            <View style={{marginHorizontal: 5}}>
              <Card title="Who do you want to include?">
                <FlatList
                  extraData={this.state}
                  data={this.state.house}
                  keyExtractor={(item, index) => index.toString()}
                  renderItem={({ item, index }) => <ListItem
                  style={styles.listItem}
                  title={this.renderTitle(item)}
                  leftElement={<CustomizedIcon name="md-person" color="#51B1D3"/>}
                  rightElement={ 
                  <TouchableOpacity onPress={() => this.updateAdd(index)} style={{
                    borderWidth:2,
                    borderColor: item.add ? "green" : "grey",
                    alignItems:'center',
                    justifyContent:'center',
                    width:30,
                    height:30,
                    backgroundColor:'#fff',
                    borderRadius:50}}>
                    <CustomizedIcon name="md-checkmark" color={item.add ? "green" : "white"}/>
                  </TouchableOpacity>}
                  />}
                  ItemSeparatorComponent={this.renderSeparator}
                />
              </Card>
            </View>
            </ScrollView>
          </KeyboardAvoidingView>
        
        <View style={styles.bottomBtn}>
            <TouchableOpacity onPress={() => { this.props.closeModal(false, false)}} style={styles.closeBtn}>
                <Text style={{color:"#FFFFFF", fontWeight: 'bold', fontSize: 18, textAlign: 'center'}}>Cancel IOU</Text>        
            </TouchableOpacity>
            <TouchableOpacity onPress={() => this.checkForm()} style={styles.continueBtn}>
              <Text style={{color:"#FFFFFF", fontWeight: 'bold', fontSize: 18, textAlign: 'center'}}>Create IOU</Text>        
            </TouchableOpacity>
          </View>
           <FlashMessage ref="modalFlash" floating={true} position="top" style={{alignItems: "center"}} textStyle={{fontWeight: 'bold'}} /> 
      </View>
    );
  }

  checkForm = async () => {
    // Push users into an array that are to be included in this IOU
    var users = []
    var selfAdded = false
    for (var i = 0; i < this.state.house.length; i++){
      if (this.state.house[i].add){
        if(this.state.house[i].id == this.state.user){
          // Set var to notify API that this IOU creation will include "this" user
          selfAdded = true
          continue
        }
        users.push(this.state.house[i].id) 
      }
    }
    if(users.length == 0){
      return this.refs.modalFlash.showMessage({
        message: "You must select at least one person!",
        type: "danger"
      });
    }
    else{
        if(this.state.money){
            if(this.state.amount == "" || this.state.description == "" || isNaN(parseFloat(this.state.amount))){
              return this.refs.modalFlash.showMessage({
                message: "Please fill out both fields!",
                type: "danger"
              });
            }
          // Request API to add a new money IOU for this house with the selected users
          url = API_ROUTE + "/add_money_iou"
          fetch(url, {
            method: 'POST',
            body: JSON.stringify({ user_id: this.state.user, users: users, amount: this.state.amount, house_id: this.state.house_id, description: this.state.description, selfAdded: selfAdded}),
            headers: { "Content-Type": "application/json" }
          })
            .then(response => response.json())
            .then(res => {
              if(res.success){
                showMessage({
                  message: "Your IOU has been created successfully!",
                  type: "default",
                  backgroundColor: "#01c853",
                });
                return this.props.closeModal(false, true)
                
              }
            })
            .catch(error => console.log(error));
        }
        // Otherwise this is an object/item IOU
        else{
            if(this.state.description == ""){
                return this.refs.modalFlash.showMessage({
                  message: "Please fill out both fields!",
                  type: "danger"
                });
            }
            else{
              // Request API to add the new object/item IOU for the selected users
              url = API_ROUTE + "/add_object_iou"
              fetch(url, {
                method: 'POST',
                body: JSON.stringify({user_id: this.state.user, users: users, object: this.state.description, house_id: this.state.house_id}),
                headers: { "Content-Type": "application/json" }
              })
              .then(response => response.json())
              .then(res => {
                showMessage({
                  message: "Your IOU has been created successfully!",
                  type: "default",
                  backgroundColor: "#01c853",
                });
                return this.props.closeModal(false, true)
              })
              .catch(error => console.log(error));
            }
        }
    }
  }

}

const styles = StyleSheet.create({
    continueBtn: {
      marginHorizontal: 10,
      backgroundColor: "#3CB371",
      padding: 16,
      borderRadius: 8,
      width: "50%"
    },
    closeBtn: {
        marginHorizontal: 10,
        backgroundColor: "red",
        padding: 16,
        borderRadius: 8,
        width: "50%"
      },
      textInput: {
        padding: 20,
        backgroundColor: "#FFF",
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "grey",
        marginBottom: 30,
        flex: 0.85
      },
      text: {
        textAlign: 'center',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 7
      },
      bottomBtn: {
        flexDirection: "row", 
        justifyContent: "space-evenly", 
        marginTop: 30,
        marginHorizontal: 15,
        marginBottom: 15,
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0
      }
  });