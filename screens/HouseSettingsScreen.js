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
            modalVisible: false
        };
    }

    componentWillMount = () => {
        this.state.user = this.props.navigation.getParam('user');
        this.state.house_id = this.props.navigation.getParam('house_id');
        this.state.house_name = this.props.navigation.getParam('house_name');
    }

    closeModal = val => {
        this.setState({
          modalVisible: val
        })
      }
   
    render() {
        return (
            <View style={styles.container}>
                <Modal
                    animationType="slide"
                    transparent={false}
                    visible={this.state.modalVisible}
                    onRequestClose={() => {
                        this.props.navigation.goBack()
                    }}>
                    <AddFriendModal navigation={this.props.navigation} closeModal={this.closeModal} house_name={this.state.house_name} house={this.state.house} user={this.state.user} house_id={this.state.house_id}/>
                </Modal>
                <ScrollView contentInset={{ top: 0, bottom: 100, marginVertical:60 }}>
                    <TouchableOpacity style={styles.btn} onPress={() => this.setState({ modalVisible: true })}>
                        <View style={{flexDirection: "row", justifyContent:"space-between"}}>
                            <Text style={styles.btnText}>Add Friend To House</Text>
                            <View style={{alignItems: "flex-end"}}>
                                <CustomizedIcon name="md-person-add" color="#3498db"/>
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
                return Alert.alert(
                    "Deleted",
                    "This house was deleted successfully",
                    [
                        {
                            text: 'Okay',
                            onPress: () => this.props.navigation.navigate("Home")
                        }
                    ],
                    { cancelable: false }
                );
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
