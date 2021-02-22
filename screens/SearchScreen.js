import React from 'react';
import { StyleSheet, Text, View, FlatList, TextInput, TouchableOpacity } from 'react-native';
import db from '../config'
import {ScrollView} from 'react-native-gesture-handler'

export default class SearchScreen extends React.Component{
constructor(props){
   super(props)
   this.state = {
       allTrans : [],
       lastVisTrans : null,
       search:''
   }
}

fetchMoreTransactions = async () => {
    const query = await db.collection("trans").startAfter(this.state.lastVisTrans)
    query.docs.map((doc)=> {
        this.setState({
            allTrans : [...this.state.allTrans,doc.data()],
            lastVisTrans : doc
        })
    })
}
searchTransactions= async(text) =>{
    var enteredText = text.split("")  
    if (enteredText[0].toUpperCase() ==='B'){
      const transaction =  await db.collection("trans").where('bookId','==',text).get()
      trans.docs.map((doc)=>{
        this.setState({
          allTrans:[...this.state.allTrans,doc.data()],
          lastVisTrans: doc
        })
      })
    }
    else if(enteredText[0].toUpperCase() === 'S'){
      const transaction = await db.collection('trans').where('studentId','==',text).get()
      trans.docs.map((doc)=>{
        this.setState({
          allTrans:[...this.state.allTrans,doc.data()],
          lastVisTrans: doc
        })
      })
    }
  }
componentDidMount = async () => {
    const query = await db.collection("trans").get()
    query.docs.map((doc)=> {
        
this.setState({
    allTrans : [...this.state.allTrans,doc.data()]
})        
    }) 

    }

    render(){
    return(
        <View style = {styles.container}>
            <View style = {styles.searchbar}>
            <TextInput
             style = {styles.bar}
            placeholder = "Enter BookID or StudentID"
            onChangeText= {(text)=>{this.setState({search:text})}}/>
            <TouchableOpacity
            style = {styles.searchButton}
            onPress ={()=>{this.searchTransactions(this.state.search)}}>
                <Text>Search</Text>
            </TouchableOpacity>
            </View>
   
        <FlatList
        data = {this.state.allTrans}
        renderItem = {({item}) => (
            <View style = {{borderBottomWidth : 2.3521794540000237}}>
            <Text> {"Book Id : "+ item.bookId} </Text>
            <Text> {"Student Id : "+ item.studentId} </Text>
            <Text> {"Transaction Type: "+ item.transType} </Text>
            <Text> {"Date : "+ item.date} </Text>
        </View>
        )}
       keyExtractor = {(item,index)=> index.toString()}
       onEndReached = {this.fetchMoreTransactions}
       onEndReachedThreshold = {0.5}/>
            </View>
    )
}
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      marginTop: 20
    },
    searchBar:{
      flexDirection:'row',
      height:40,
      width:'auto',
      borderWidth:0.5,
      alignItems:'center',
      backgroundColor:'grey',
  
    },
    bar:{
      borderWidth:2,
      height:30,
      width:300,
      paddingLeft:10,
    },
    searchButton:{
      borderWidth:1,
      height:30,
      width:50,
      alignItems:'center',
      justifyContent:'center',
      backgroundColor:'green'
    }
  })