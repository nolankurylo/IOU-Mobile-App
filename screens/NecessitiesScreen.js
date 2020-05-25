import React from 'react';
import {
    Text,
    TouchableOpacity,
    FlatList,
    View,
    StyleSheet,
    ScrollView,
    Modal,
    TextInput,
    Alert
} from "react-native";
import {
    Card,
    ListItem,
} from "react-native-elements";
import { API_ROUTE } from "react-native-dotenv";
import AddNecessityModal from "../components/AddNecessityModal"
import IOUModal from "../components/IOUModal"
import { showMessage } from "react-native-flash-message";

export default class NecessitiesScreen extends React.Component {
    static navigationOptions = ({ navigation }) => {
        return {
            headerLeft: <TouchableOpacity style={{ padding: 5, flexDirection: "row", }} onPress={() => {
                navigation.goBack()
            }}>
                <Text style={{ marginLeft: 10, fontSize: 20, fontWeight: 'bold', color: "#51B1D3" }}>Done</Text>
            </TouchableOpacity>
        }
    };
    constructor(props) {
        super(props);
        this.state = {
            users: [],
            user: "",
            house_id: "",
            necessityModalVisible: false,
            IOUModalVisible: false,
            necessities: [],
            house: [],
            item: {}
        }
        this.navigationWillFocusListener = props.navigation.addListener('willFocus', async () => {
            this.state.user = this.props.navigation.getParam('user');
            this.state.house_id = this.props.navigation.getParam('house_id');
            this.getNecessities()
          })
    }
    
    componentDidMount = () => {
        this.state.user = this.props.navigation.getParam('user');
        this.state.house_id = this.props.navigation.getParam('house_id');
        this.state.house = this.props.navigation.getParam('house');
        this.getNecessities()
    }
    
    closeIOUModal = (state, iou_created) => {
        this.setState({
          IOUModalVisible: state
        })
        if(iou_created){
            this.resolveItem(this.state.item)
        }
      }

    closeNecessityModal = (state, reload) => {
        this.setState({
            necessityModalVisible: state
        })
        if(reload){
            this.getNecessities()
        }
    }

    getNecessities = () => {
        // Request API to get all the items that this house needs
        url = API_ROUTE + "/get_necessities/" + this.state.house_id
        fetch(url, {
            method: 'GET'
        })
        .then(response => response.json())
        .then(res => {
            var necessities = []
            for (var i = 0; i < res.necessities.length; i++) {
                necessities.push({ id: res.necessities[i].id, item: res.necessities[i].item, description: res.necessities[i].description, added_by: res.necessities[i].username})
            }
            this.setState({ necessities: necessities });

        })
        .catch(error => console.log(error));
    }

    render() {
        return (
            <View style={{flex: 1, backgroundColor:"#51B1D3"}}>
            <Modal
            animationType="slide"
            transparent={false}
            visible={this.state.necessityModalVisible}
            onRequestClose={() => {
            console.log("close")
            }}>
            <AddNecessityModal navigation={this.props.navigation} closeNecessityModal={this.closeNecessityModal} house_id={this.state.house_id} user={this.state.user} />
            </Modal>
            <Modal
            animationType="slide"
            transparent={false}
            visible={this.state.IOUModalVisible}
            onRequestClose={() => {
                console.log("close")
            }}>
            <IOUModal navigation={this.props.navigation} closeModal={this.closeIOUModal} house={this.state.house} user={this.state.user} house_id={this.state.house_id} item={this.state.item.item} description={this.state.item.description}/>
            </Modal>
                <ScrollView>
                    <View style={{ marginHorizontal: 15, marginTop: 20 }}>
                        <Card title="Things Your House Needs">
                            <FlatList
                                extraData={this.state}
                                ListEmptyComponent={<Text style={{ textAlign: "center", marginVertical: "3%", fontWeight: "bold", fontSize: 13 }}>Your house does not need any new items at this time. Try adding some below!</Text>}
                                data={this.state.necessities}
                                keyExtractor={(item, index) => index.toString()}
                                renderItem={({ item, index }) => 
                                <TouchableOpacity onPress={() => this.decisonAlert(item)}>
                                <ListItem
                                    containerStyle={styles.listItem}
                                    title={<Text><Text style={{ fontWeight: 'bold' }}>Item: </Text>{item.item}</Text>}
                                    subtitle={item.description ? <Text><Text style={{ fontWeight: 'bold' }}>For: </Text>{item.description}</Text> : null}
                                    rightElement={<View><Text style={{fontWeight: 'bold'}}>Added By:</Text><Text>{item.added_by}</Text></View>}
                                /></TouchableOpacity>}
                                
                            />
                        </Card>
                    </View>
                </ScrollView>
                <TouchableOpacity style={styles.continueBtn} onPress={() => this.setState({ necessityModalVisible: true })} >
                    <Text style={{color:"#FFFFFF", fontWeight: 'bold', fontSize: 18, textAlign: 'center'}}>Add New Item</Text>        
                </TouchableOpacity>
            </View>
        );
    }

    decisonAlert = item => {
        // Propose options to user regarding how they want to resolve this necessity item
        return Alert.alert(
          "Do you want to create an IOU for this item or just resolve the item?",
          "",
          [
            {
              text: "Create IOU",
              onPress: () => this.startIOU(item)
            },
            {
                text: 'Just Resolve Item',
                onPress: () => this.resolveItem(item)
            },
            {
              text: "Cancel",
            }
          ],
          { cancelable: false }
        );
    }

    startIOU = item => {
        this.setState({ IOUModalVisible: true, item: item })
    }

    resolveItem = (item) => {
        // Request API to simply resolve this necessity item, no IOU
        url = API_ROUTE + "/resolve_necessity_item"
        fetch(url, {
            method: 'POST',
            body: JSON.stringify({ house_id: this.state.house_id, id: item.id }),
            headers: { "Content-Type": "application/json" }
        })
            .then(response => response.json())
            .then(res => {
                if(res.success){
                    this.getNecessities()
                    return showMessage({
                        message: `${item.item} was resolved successfully!`,
                        type: "default",
                        backgroundColor: "#01c853",
                    });
                }
                
            })
            .catch(error => console.log(error));
    }

}

const styles = StyleSheet.create({
  textInput: {
    padding: 20,
    backgroundColor: "#FFF",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "grey",
    marginBottom: 30
  },
  continueBtn: {
    position: "absolute",
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
  },
  listItem: {
    flex: 1,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#A1F4FF",
    marginVertical: 7,
    backgroundColor: "#A1F4FF"
  }
});
