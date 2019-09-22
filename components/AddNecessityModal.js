import React from 'react';
import {
    Text,
    TouchableOpacity,
    View,
    StyleSheet,
    ScrollView,
    Alert,
    TextInput,
    TouchableWithoutFeedback,
    Keyboard,
  KeyboardAvoidingView
  } from "react-native";
  import {
    Card
  } from "react-native-elements";
import CustomizedIcon from "./CustomizedIcon"
import { API_ROUTE } from "react-native-dotenv";

export default class AddNecessityModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      house_id: this.props.house_id,
      user: this.props.user,
      item: "",
      description: "",
    } 
  }
   
  scroll = y => {
    // Scroll to next textInput box on press
    this.scrollView.scrollTo({ x: 0, y: y, animated: true })
    return
  }

  render() {
    return (
    <KeyboardAvoidingView behavior='padding' style={{ flex: 1 }}>
      <ScrollView style={{ flex: 1, backgroundColor: "#3498db" }} contentContainerStyle={{ flex: 1, alignItems: 'center', justifyContent: 'center' }} ref={scrollView => this.scrollView = scrollView} keyboardShouldPersistTaps="handled">
            <Card  title="Explain the item you are adding">
                <View style={{marginVertical: 5}}> 
                  <Text style={styles.text}>What is the item?</Text>
                  <View style={{ flexDirection: "row" }}>
                    <TextInput maxHeight={100} multiline maxLength={30} onChangeText={item => this.setState({ item })} style={styles.textInput} placeholder="Enter Item" />
                    <View style={{flex: 0.15, marginLeft:10}}>
                      <TouchableWithoutFeedback style={{ flex: 1 }} onPress={() => this.scroll(120)}>
                        <View>
                          <CustomizedIcon name="md-arrow-round-forward" color="#3498db" size={40} />
                        </View> 
                      </TouchableWithoutFeedback> 
                    </View>
                  </View>
                </View>
                <View style={{marginVertical: 5}}> 
                  <Text style={styles.text}>Add any additional information:</Text>
                  <View style={{ flexDirection: "row" }}>
                    <TextInput maxHeight={100} multiline maxLength={100} onChangeText={description => this.setState({ description })} style={styles.textInput} placeholder="Enter Additional Information" />
                    <View style={{ flex: 0.15, marginLeft: 10 }}>
                      <TouchableWithoutFeedback style={{ flex: 1 }} onPress={Keyboard.dismiss}>
                        <View>
                          <CustomizedIcon name="md-arrow-round-forward" color="#3498db" size={40} />
                        </View>
                      </TouchableWithoutFeedback>
                    </View>
                  </View>
                </View>
                <TouchableOpacity style={styles.continueBtn} onPress={() => this.addNewItem()} >
                    <Text style={{color:"#FFFFFF", fontWeight: 'bold', fontSize: 18, textAlign: 'center'}}>Add New Item</Text>        
                </TouchableOpacity>
                <TouchableOpacity onPress={() => { this.props.closeNecessityModal(false, false)}} style={styles.closeBtn}>
                    <Text style={{color:"#FFFFFF", fontWeight: 'bold', fontSize: 18, textAlign: 'center'}}>Cancel</Text>        
                </TouchableOpacity>
            </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  addNewItem = () => {
    if (this.state.item == ""){
        return Alert.alert(
            'Wait!',
            'Please insert an Item',
            [
              {
                text: 'Okay',
                style: 'cancel',
              },
            ],
            {cancelable: false},
          );
    }
    // Request API to insert this necessity item for this house
    url = API_ROUTE + '/insert_necessity'
    fetch(url, {
        method: 'POST',
        body: JSON.stringify({added_by: this.state.user, house_id: this.state.house_id, item: this.state.item, description: this.state.description}),
        headers: { "Content-Type": "application/json" }
      })
      .then(response => response.json())
      .then(res => {
        return Alert.alert(
          'Yay!',
          'Your item was added successfully!',
          [
            {
              text: 'Okay',
              style: 'cancel',
              onPress: () => this.props.closeNecessityModal(false, true)
            },
          ],
          {cancelable: false},
        );
      })
      .catch(error => console.log(error));
  }
}

const styles = StyleSheet.create({
    text: {
        textAlign:"center", 
        fontWeight:"bold", 
        fontSize:18,
        marginBottom: 5
    },
    continueBtn: {
        marginTop: 30,
        marginHorizontal: 10,
        marginBottom: 15,
        backgroundColor: "#3CB371",
        padding: 16,
        alignItems: "stretch",
        borderRadius: 8
      },
    closeBtn: {
        marginHorizontal: 10,
        marginTop: 10,
        backgroundColor: "red",
        padding: 16,
        alignItems: "stretch",
        borderRadius: 8
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
  });