import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  RefreshControl,
  FlatList,
  Modal,
  AsyncStorage
} from "react-native";
import { API_ROUTE } from "react-native-dotenv";
import {
  Card,
  ListItem
} from "react-native-elements";
import Loader from "../components/Loader"
import CustomizedIcon from "../components/CustomizedIcon"
import HouseList from "../components/HouseList"
import IOUModal from "../components/IOUModal"

export default class HouseScreen extends React.Component {
  static navigationOptions = ({navigation}) => {
    // If this house was just created, disable ability to back swipe to previous screen
    if (navigation.getParam("creation")){
      gesturesEnabled =  false
    }
    // Otherwise enable ability to swipe back to previous screen
    else{
      gesturesEnabled = true
    }
    return {
    gesturesEnabled: gesturesEnabled,
      headerTitle: <Text style={{ fontSize: 20, fontWeight: 'bold', color: "#3498db"}}>{navigation.getParam("house_name")}</Text>,
    headerLeft: <TouchableOpacity style={{padding: 5, width: 75, flexDirection: "row",}} onPress={() => {
        navigation.navigate("Home")}}>
      <CustomizedIcon name="ios-arrow-back" color="#3498db"/>
      <Text style={{ marginLeft:10, fontSize: 20, fontWeight:'bold', color: "#3498db"}}>Home</Text>
      </TouchableOpacity>,
    headerRight: <TouchableOpacity
    style={{marginHorizontal: 20}}
    onPress={ () => navigation.getParam('settings')()}>
    <CustomizedIcon name="md-settings" color="grey" size={30}></CustomizedIcon>
    </TouchableOpacity>,
    }
  };

  constructor(props) {
    super(props)
    this.state = {
      user: "",
      house: [],
      loading: false,
      search: "",
      house_id: "",
      house_name: "",
      you_owe: 0.00,
      you_get_back: 0.00,
      numNecessityItems: 0,
      IOUModalVisible: false,
      refreshing: false
    };

    this.navigationWillFocusListener = props.navigation.addListener('willFocus', async () => {
      this.state.house_id = this.props.navigation.getParam('house_id');
      this.state.house_name = this.props.navigation.getParam('house_name');
      if(!user){
        var user = await AsyncStorage.getItem("user")
        this.setState({ user: user });
        this.getHouse()
      }else{
        this.getHouse()
      }
    })
    
  }
  
  closeIOUModal = (state, iou_created) => {
    this.setState({
      IOUModalVisible: state
    })
    if(iou_created){
        this.getHouse()
    }
  }
  componentWillMount = () => {
    this.setState({ loading: true });
    const { navigation } = this.props
    navigation.setParams({
        settings: this.settings,
    })
  };
  componentWillUnmount = () => {
    this.setState({ modalVisibale: false, loading: false });
  }

  _onRefresh = () => {
    this.setState({ refreshing: true });
    this.getHouse();
    this.setState({ refreshing: false });
  };

  render() {
    return ( 
      <View style={{flex:1}}>
        <Modal
          animationType="slide"
          transparent={false}
          visible={this.state.IOUModalVisible}
          onRequestClose={() => {
              console.log("close")
          }}>
          <IOUModal navigation={this.props.navigation} closeModal={this.closeIOUModal} house={this.state.house} user={this.state.user} house_id={this.state.house_id} item="" description=""/>
          </Modal>
       
        <View style={{ backgroundColor:"grey", alignItems:"center", flexDirection: "row", justifyContent: "space-between" }}>
          <View style={{ flex:1, justifyContent:"flex-start", flexDirection: 'row', flexWrap: 'wrap', marginLeft: 20, marginTop: -20}}>
            <Text style={{width: 150, fontSize: 16,color: "#FFF"}}>Your House Owes You: <Text style={{color:"#3CB371", fontWeight: "bold", fontSize: 20}}>${this.state.you_get_back}</Text></Text>
          </View>
            <CustomizedIcon name="ios-home" color="#3CB371" size={100}/>
          <View style={{ flex:1, justifyContent:"flex-end", flexDirection: 'row', flexWrap: 'wrap', marginRight: 20, marginTop: -20}}>
            <Text style={{width: 120, fontSize: 16, color: "#FFF"}}>You Owe Your</Text>
            <Text style={{width: 120, fontSize: 16, color: "#FFF"}}>House: <Text style={{color:"red", fontSize: 20, fontWeight: 'bold'}}>${this.state.you_owe}</Text></Text>
          </View>
        </View>
        <View style={{backgroundColor: "#3498db"}}>
          <View style={{flexDirection: "row"}}>
            <TouchableOpacity style={styles.iouBtn} onPress={() => this.setState({ IOUModalVisible: true })}>
              <Text style={{color:"grey", fontWeight: 'bold', fontSize: 14, textAlign: 'center'}} >Create IOU</Text>        
            </TouchableOpacity>
            <TouchableOpacity style={styles.boardBtn} onPress={() => this.props.navigation.navigate('Necessities', {house: this.state.house, house_id: this.state.house_id, user: this.state.user})}>
              <Text style={{color:"grey", fontWeight: 'bold', fontSize: 15, textAlign: 'center'}}>Necessity Board</Text>
              <Text style={{color:"grey", fontWeight: 'bold', fontSize: 17, textAlign: 'center'}}>({this.state.numNecessityItems})</Text>          
            </TouchableOpacity>
          </View>
        </View>
        <ScrollView style={{ flexGrow: 1 }} refreshControl={
          <RefreshControl
            refreshing={this.state.refreshing}
            onRefresh={this._onRefresh}
          />
        }>
          <Card title="Living In Your House">
            <FlatList
              data={this.state.house}
              renderItem={({ item }) => <TouchableOpacity onPress={() => this.props.navigation.navigate("IOUHistory", { user: this.state.user, other_user: item, house_id: this.state.house_id })} ><ListItem
              style={styles.listItem}
              title={<HouseList numItems={item.items} amount={item.amount}/>}
              leftElement={<View style={{flexDirection: 'row', flexWrap: 'wrap'}}><CustomizedIcon name="md-person" color="#3498db"/><Text style={styles.left}>{item.name}</Text></View>}
              rightElement={<CustomizedIcon name="ios-arrow-forward" color="#3498db" size={40}/>}
              /></TouchableOpacity>}
              keyExtractor={(item, index) => index.toString()}
              ItemSeparatorComponent={this.renderSeparator}
              centerContent
            />
          </Card>
        </ScrollView>
        {this.renderLoading()}
      </View>
    );
  }

  
  getHouse = () => {
    // Request API to get all the information about this house from the current user's POV
    url = API_ROUTE + "/get_house/" + this.state.house_id + "/" + this.state.user 
    fetch(url, {
      method: "GET"
    })
      .then(response => response.json())
      .then(res => {
        var house = [];
        you_get_back = 0;
        you_owe = 0
        for (var i = 0; i < res.house.length; i++) {
          house.push({ id: res.house[i].other_user, name: res.house[i].username, add: true, amount: res.house[i].amount, items: res.house[i].items})
          if(res.house[i].amount >= 0){
            you_get_back += parseFloat(res.house[i].amount)
          }
          else {
            you_owe += parseFloat(res.house[i].amount) * -1
          }
        }
        this.setState({
          numNecessityItems: res.necessities.count,
          house: house,
          loading: false,
          you_get_back: you_get_back.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}),
          you_owe: you_owe.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}),
        });
      })
      .catch(err => this.setState({loading: false }));
  };
  
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

  renderLoading() {
    if (this.state.loading) {
      return <Loader loading={this.state.loading} color={"#000000"} /> 
    } else {
      return null
    }
  }

  settings = () => {
    this.props.navigation.navigate("HouseSettings", {
      user: this.state.user,
      house_id: this.state.house_id,
      house_name: this.state.house_name
    })
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#3498db"
  },
  listItem: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
    textAlign: "center",
    marginBottom: 20,
    marginTop: 20
  },
  subContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "flex-end"
  },
  iouBtn: {
    flex: 1,
    marginHorizontal: 20,
    marginVertical: 35,
    backgroundColor: "#33FFB8",
    padding: 10,
    alignItems: "stretch",
    justifyContent: 'center',
    borderRadius: 8
  },
  boardBtn: {
    flex: 1,
    marginHorizontal: 20,
    justifyContent: 'center',
    marginVertical: 35,
    backgroundColor: "#FFAF33",
    padding: 10,
    alignItems: "stretch",
    borderRadius: 8
  },
  amount: {
    color: "#FFF",
    fontSize: 17,
    fontWeight: 'bold',
    textAlign: 'center'
  },
  left: {
    marginLeft:10, 
    marginTop: 4, 
    fontSize: 18,
    width: 100
  }
});