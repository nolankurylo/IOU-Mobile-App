import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  AsyncStorage,
  View,
  FlatList,
  RefreshControl
} from "react-native";
import TabBarIcon from "../components/TabBarIcon";
import CustomizedIcon from "../components/CustomizedIcon"
import { API_ROUTE } from "react-native-dotenv";
import { ListItem } from "react-native-elements";
import Loader from "../components/Loader";
import TouchableScale from "react-native-touchable-scale"; 

export default class HomeScreen extends React.Component {
  static navigationOptions = ({navigation}) => {
    return {
    headerTitle: <TabBarIcon name="ios-home" />,
    headerRight: <TouchableOpacity onPress={ () =>  navigation.getParam('createHouse')()} style={{marginRight: 15, flexDirection: 'row'}}>
      <Text style={{flexDirection: 'column', marginTop: 5, marginRight: 10, color: "#D0AE05"}}>Create House</Text>
      <CustomizedIcon  name="ios-beer" color="#D0AE05" />
      </TouchableOpacity>
    }
  };

  constructor(props) {
    super(props);
    this.navigationWillFocusListener = props.navigation.addListener('willFocus', async () => {
      if(!user){
        var user = await AsyncStorage.getItem("user")
        this.setState({ user: user });
        this.getHouses();
      }
    })
    this.state = {
      user: "",
      friends: [],
      houses: [],
      loading: false,
      refreshing: false
    };
  }
  
  componentWillMount = () => {
    this.setState({ loading: true  });
  }

  componentDidMount = () => {
    const { navigation } = this.props
    navigation.setParams({
        createHouse: this.createHouse,
    })
  }

  _onRefresh = () => {
    this.setState({ refreshing: true });
    this.getHouses();
    this.setState({ refreshing: false });
  };


  renderLoading() {
    if (this.state.loading) {
      return <Loader loading={this.state.loading} color={"#000000"} /> 
    } else {
      return null
    }
  }

  renderTitle = () => {
    if (this.state.houses.length > 0 ){
      return (
        <View >
          <View style={{ margin: 15 }}>
            <Text style={styles.titleText}>Your IOU Houses:</Text>
          </View>
        </View>
      );
    }
    else {
      return (
        <View style={{ margin: 15 }}>
          <Text style={styles.titleText}>
            You Currently Have No IOU Houses
          </Text>
        </View>
      );
    } 
  }

  renderButton = () => {
    if(this.state.houses.length == 0){
      return (
        <View>
          <TouchableOpacity onPress={this.createHouse} style={styles.createBtn}>
            <Text style={styles.btnText}>Add A New House</Text>
          </TouchableOpacity>
        </View>
      );
    }
    else{
      return null
    }
  }

  render() {
    return (
      <View style={styles.container}>
        {this.renderTitle()}
        <ScrollView
        contentContainerStyle={{flexGrow:1}}
        refreshControl={
          <RefreshControl
            refreshing={this.state.refreshing}
            onRefresh={this._onRefresh}
          />
        }>
        
          <View style={styles.subContainer}>
          {this.renderButton()}
          <FlatList
            extraData={this.state}
            data={this.state.houses}
            renderItem={({ item }) => 
              <ListItem
                containerStyle={styles.listItem}
                onPress={() => this.props.navigation.navigate("House", { house_id: item.id, house_name: item.name })}
                Component={TouchableScale}
                friction={90} //
                tension={100} 
                activeScale={0.95} 
                linearGradientProps={{
                  colors: ['#67FFE1', '#00CDFF'],
                  start: [1, 0],
                  end: [0.2, 0],
                }}
                title={item.name}
                titleStyle={{ color: 'white', fontWeight: 'bold', textAlign: 'center', fontSize: 22 }}
                chevronColor="white"
                chevron
              />}
            keyExtractor={(item, index) => index.toString()}
            ItemSeparatorComponent={this.renderSeparator}
          />
          </View>
        </ScrollView>
        {this.renderLoading()}
      </View>
    );
  }

  getHouses = () => {
    // Request API to get a list of all houses the current user is apart of 
    url = API_ROUTE + "/get_houses/" + this.state.user
    fetch(url, {
      method: "GET"
    })
      .then(response => response.json())
      .then(res => {
        var houses = [];
        for (var i = 0; i < res.houses.length; i++) {
            houses.push({ id: res.houses[i].house_id, name: res.houses[i].name})    
        }
        this.setState({
          houses: houses,
          loading: false
        });
      })
      .catch(error => this.setState({ loading: false }));
  };

  createHouse = () => {
    // Navigate to 'CreateHouseName' to start creating a new house
    this.props.navigation.navigate("CreateHouseName");
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#6C6C6C"
  },
  subContainer: {
    flexGrow: 1,
    borderRadius: 20,
    backgroundColor: "#3498db",
    borderColor: "transparent"
  },
  subText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center"
  },
  titleText: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center"
  },
  btnText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#6C6C6C",
    textAlign: "center"
  },
  contentContainer: {
    paddingTop: 50
  },
  listItem: {
    flex: 1,
    margin: 20,
    borderWidth: 1,
    borderColor: "transparent",
    borderRadius: 10
  },
  createBtn: {
    marginTop: 100,
    marginHorizontal: 60,
    marginBottom: 15,
    backgroundColor: "#00FFC1",
    padding: 16,
    alignItems: "center",
    borderRadius: 8
  }
});
