import React from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Alert,
    Modal
} from "react-native";
import { API_ROUTE } from "react-native-dotenv";
import CustomizedIcon from "../components/CustomizedIcon"
import AddFriendModal from '../components/AddFriendModal'
import ChangeHouseNameModal from "../components/ChangeHouseNameModal"
import { showMessage } from "react-native-flash-message";

export default class HouseSettingsScreen extends React.Component {
    static navigationOptions = ({ navigation }) => {
        return {
            headerTitle: "House Settings",
        }
    };
    constructor(props) {
        super(props);
        this.state = {
            house_id: "",
            house: "",
            user: "",
            house_name: "",
            addFriendModalVisible: false,
            changeHouseNameModalVisible: false

        };
    }

    componentDidMount = () => {
        this.state.user = this.props.navigation.getParam('user');
        this.state.house_id = this.props.navigation.getParam('house_id');
        this.state.house_name = this.props.navigation.getParam('house_name');
    }

    closeAddFriendModal = val => {
        this.setState({
          addFriendModalVisible: val
        })
      }

      closeChangeHouseNameModal = val => {
          this.setState({
              changeHouseNameModalVisible: val
          })
      }
   
    render() {
        return (
            <View style={styles.container}>
                <Modal
                    animationType="slide"
                    transparent={false}
                    visible={this.state.addFriendModalVisible}
                    onRequestClose={() => {
                        this.props.navigation.goBack()
                    }}>
                    <AddFriendModal navigation={this.props.navigation} closeModal={this.closeAddFriendModal} house_name={this.state.house_name} house={this.state.house} user={this.state.user} house_id={this.state.house_id}/>
                </Modal>
                <Modal
                    animationType="slide"
                    transparent={false}
                    visible={this.state.changeHouseNameModalVisible}
                    onRequestClose={() => {
                        this.props.navigation.goBack()
                    }}>
                    <ChangeHouseNameModal navigation={this.props.navigation} closeModal={this.closeChangeHouseNameModal} house_name={this.state.house_name} house={this.state.house} user={this.state.user} house_id={this.state.house_id}/>
                </Modal>
                <ScrollView contentInset={{ top: 0, bottom: 100, marginVertical:60 }}>
                    <TouchableOpacity style={styles.btn} onPress={() => this.setState({ addFriendModalVisible: true })}>
                        <View style={{flexDirection: "row", justifyContent:"space-between"}}>
                            <Text style={styles.btnText}>Add Friend To House</Text>
                            <View style={{alignItems: "flex-end"}}>
                                <CustomizedIcon name="md-person-add" color="#51B1D3"/>
                            </View>  
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.btn} onPress={() => this.setState({ changeHouseNameModalVisible: true })}>
                        <View style={{flexDirection: "row", justifyContent:"space-between"}}>
                            <Text style={styles.btnText}>Change House Name</Text>
                            <View style={{alignItems: "flex-end"}}>
                                <CustomizedIcon name="ios-home" color="#51B1D3"/>
                            </View>  
                        </View>
                    </TouchableOpacity>
                </ScrollView>
                <TouchableOpacity onPress={() => this.verifyDelete()} style={styles.deleteBtn}>
                    <Text style={styles.btnText}>Delete House</Text>
                </TouchableOpacity>
            </View>
        );
    }

    verifyDelete = () => {
        // Verify that the user is sure that they want to delete this house
        return Alert.alert(
            "Delete House",
            "This will delete the house for everyone a part of it",
            [
              {
                text: "Cancel",
                style: 'cancel'
              },
              {
                  text: 'Delete house',
                  onPress: () => this.delete()
              }
            ],
            { cancelable: false }
        );
    }

    delete = () => {
        // Request API to delete the house, deleteing all IOU/necessity items 
        url = API_ROUTE + '/cancel_house/' + this.state.house_id
        fetch(url, {
          method: "GET"
        })
        .then(response => response.json())
        .then(res => {
            if(res.success){
                showMessage({
                    message: "House deleted successfully!",
                    type: "default",
                    backgroundColor: "#01c853",
                });
                return this.props.navigation.navigate("Home")
            } 
        })
        .catch(err => {
        this.setState({loading: false })
        console.log(err)
        });
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFF"
    },
    deleteBtn: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        marginTop: 30,
        marginHorizontal: 30,
        marginBottom: 15,
        backgroundColor: "#C70039",
        padding: 16,
        alignItems: "stretch",
        borderRadius: 8
      },
    btn: {
        marginTop: 30,
        marginHorizontal: 30,
        marginBottom: 15,
        backgroundColor: "#C6C6C6",
        padding: 16,
        alignItems: "stretch",
        borderRadius: 8
    },
    btnText: {
        fontWeight: "bold",
        fontSize: 20,
        color: "#FFF",
        textAlign: "center"
    }

});
