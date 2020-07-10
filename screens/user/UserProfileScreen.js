import React, {useCallback, useState, useEffect} from "react";
import {
    View,
    Text,
    StyleSheet,
    Image,
    Dimensions,
    RefreshControl,
    ActivityIndicator,
    TouchableOpacity
} from "react-native";

import { Container, Content, Button } from 'native-base'
var { height, width } = Dimensions.get('window');

import Colors from '../../constants/Colors';
import * as usersActions from '../../store/actions/users';
import * as postsActions from '../../store/actions/posts';
import { useDispatch, useSelector } from "react-redux";
import ENV from '../../env';
import { TouchableHighlight } from "react-native-gesture-handler";

const UserProfileScreen = (props) => {
    const { route } = props;
    const loggedInUserId = useSelector(state => state.auth.user._id);
    let userId;

    if(route.params && route.params.userId){
        userId = route.params.userId;
    } else {
        userId = useSelector(state => state.auth.user._id);
    }
    
    const users = useSelector(state => state.users.allUsers);
    const posts = useSelector(state => state.posts.allPosts);
    const currUser = users.filter(u => u._id === userId)[0];
    const currUserPosts = posts.filter(p => p.postedBy._id === userId);
    
    const [isRefreshing,setIsRefreshing] = useState(false);
    const [isLoading,  setIsLoading] = useState(false);
    const [imageUri, setImageUri] = useState(`${ENV.apiUrl}/user/photo/${currUser._id}`);
    
    const dispatch = useDispatch();


    const loadUsers = useCallback(async () => {
        setIsRefreshing(true);
        console.log("LOADING USERS");
        try {
            await dispatch(usersActions.fetchUsers());
            await dispatch(postsActions.fetchPosts());
        } catch (err) {
            console.log(err);
        }
        setIsRefreshing(false);
    }, [dispatch, setIsLoading]);

    // useEffect(() => {
    //     console.log("USE EFFECT");
    //     setIsLoading(true);
    //     loadUsers()
    //     .then(() => {
    //         setIsLoading(false);
    //     });
    // }, [dispatch, loadUsers]);

    const onImageErrorHandler = () => {
        setImageUri(ENV.defaultImageUri)
    }

    const renderSectionOne = () => {
        return currUserPosts.map((post, index) => {
            return (
                <TouchableOpacity 
                    key={index}
                    onPress={() => {
                        props.navigation.navigate('UserPosts')
                    }}
                >
                    <View  style={[{ width: (width) / 3 }, { height: (width) / 3 }, { marginBottom: 2 }, index % 3 !== 0 ? { paddingLeft: 2 } : { paddingLeft: 0 }]}>
                        <Image 
                            style={{
                                flex: 1,
                                alignSelf: 'stretch',
                                width: undefined,
                                height: undefined,
                                backgroundColor: '#c2c2c2'
                            }}
                            source={
                                post.updated ? (
                                    { uri: `${ENV.apiUrl}/post/photo/${post._id}?${new Date()}` }
                                ) : (
                                    { uri: `${ENV.apiUrl}/post/photo/${post._id}` }
                                )
                            }
                        />
                    </View>
                </TouchableOpacity>
            )
        })
    }

    const renderSection = () => {
            return (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                    {renderSectionOne()}
                </View>
            )
    }


    if(isLoading){
        return (
            <View style={styles.centered} >
                <ActivityIndicator size='large' color={Colors.primary} />
            </View>
        );
    }

    return (
        <Container style={styles.container} >
            <Content 
                refreshControl={
                    <RefreshControl refreshing={isRefreshing} onRefresh={loadUsers} /> 
                } 
            >
                <View style={{ paddingTop: 20 }}>
                    {/** User Photo Stats**/}
                    <View style={{ flexDirection: 'row' }}>
                        {/**User photo takes 1/3rd of view horizontally **/}
                        <View
                            style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-start' }}>
                            <Image 
                                source={{ uri: imageUri }}
                                onError={onImageErrorHandler}
                                style={{ width: 75, height: 75, borderRadius: 37.5, backgroundColor: "#c2c2c2" }}
                            />
                        </View>
                        {/**User Stats take 2/3rd of view horizontally **/}
                        <View style={{ flex: 3 }}>
                            {/** Stats **/}
                            <View
                                style={{
                                    flexDirection: 'row',
                                    justifyContent: 'space-around',
                                    alignItems: 'flex-end'
                                }}>
                                <View style={{ alignItems: 'center' }}>
                                    <Text> {currUserPosts.length} </Text>
                                    <Text style={{ fontSize: 10, color: 'grey' }}>Posts</Text>
                                </View>
                                <View style={{ alignItems: 'center' }}>
                                    <Text> { currUser.followers.length } </Text>
                                    <Text style={{ fontSize: 10, color: 'grey' }}>Followers</Text>
                                </View>
                                <View style={{ alignItems: 'center' }}>
                                    <Text> { currUser.following.length } </Text>
                                    <Text style={{ fontSize: 10, color: 'grey' }}>Following</Text>
                                </View>
                            </View>
                            
                            {/**
                             * Edit profile and Settings Buttons **/}

                            { userId === loggedInUserId && (
                                <View style={{ flexDirection: 'row', alignItems: 'flex-start', paddingTop: 10 }}>
                                    <View
                                        style={{ flexDirection: 'row' }}>
                                        {/** Edit profile takes up 3/4th **/}
                                        <Button bordered dark
                                            style={{ flex: 2, marginLeft: 10, justifyContent: 'center', height: 30 }}><Text>Edit Profile</Text></Button>
                                        <Button 
                                            bordered 
                                            dark
                                            style={{ flex: 2, marginLeft: 10, marginRight: 10, backgroundColor: 'red', justifyContent: 'center', height: 30 }}
                                        >
                                            <Text>Delete Profile</Text>
                                        </Button>
                                    </View>
                                </View>
                            ) }
                            {/**End edit profile**/}
                        </View>
                    </View>

                    <View style={{ paddingBottom: 10, paddingTop: 10 }}>
                        <View style={{ paddingHorizontal: 10 }} >
                            <Text style={{ fontWeight: 'bold', fontSize: 18 }}>{currUser.name} </Text>
                            { currUser.about && (
                                <Text>{currUser.about} </Text>
                            ) }
                            <Text>{currUser.email}</Text>
                        </View>
                    </View>
                </View>


                <View>
                    {renderSection()}
                </View>
            </Content>
        
        </Container >
    );
}





export const screenOptions = (navData) => {

    const routeParams = navData.route.params ? navData.route.params : {};
    return{
        headerTitle: routeParams.name ? routeParams.name : "Profile"
    }
}




const styles = StyleSheet.create({
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    container: {
        flex: 1,
        backgroundColor: 'white'
    }
});

export default UserProfileScreen;

