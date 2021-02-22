import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Image, TextInput, Alert, KeyboardAvoidingView, ToastAndroid } from 'react-native';
import * as Permissions from 'expo-permissions';
import {BarCodeScanner} from 'expo-barcode-scanner';
import firebase from 'firebase';
import db from '../config';


export default class BookTransScreen extends React.Component{
constructor(){
    super();
    this.state = {
hasCameraPermissions : null,
scanned : false,
scannedData : '',
buttonState : 'normal',
scannedBookID : '',
scannedStudentID : '',
transMessage : '',
    }
}
getCameraPermissions = async (id) => {
    const {status} = await Permissions.askAsync(Permissions.CAMERA)
    this.setState({
        hasCameraPermissions : status === "granted",
        buttonState : id,
        scanned : false
    })
}
handleBarCodeScanned = async ({type,data}) => {
    const {buttonState} = this.state
    if(buttonState === "bookID"){
        this.setState({
            scanned : true,
            scannedBookID : data,
            buttonState : 'normal'
        })
    }
    else if(buttonState === "studentID"){
        this.setState({
            scanned : true,
            scannedstudentID : data,
            buttonState : 'normal'
    })
}
}

initiateBookIssue = async() => {
    db.collection("trans").add({
        'studentId' : this.state.scannedStudentID,
        'bookId' : this.state.scannedBookID,
        'date' : firebase.firestore.Timestamp.now().toDate(),
        'transType' : "issue",
    })
    db.collection("books").doc(this.state.scannedBookID).update({
        'bookFree' : false
    })
    db.collection("students").doc(this.state.scannedStudentID).update({
'numBookIssued' : firebase.firestore.FieldValue.increment(1)
    })
   // Alert.alert("This book is issued. Go look for another book. Come back next week or so.")
this.setState({
    scannedBookID : '',
    scannedStudentID : ''
})
}
initiateBookReturn = async() => {
    db.collection("trans").add({
        'studentId' : this.state.scannedStudentID,
        'bookId' : this.state.scannedBookID,
        'date' : firebase.firestore.Timestamp.now().toDate(),
        'transType' : "return"
    })
    db.collection("books").doc(this.state.scannedBookID).update({
        'bookFree' : true
    })
    db.collection("students").doc(this.state.scannedStudentID).update({
        'numBookIssued' : firebase.firestore.FieldValue.increment(-1)
            })
           //Alert.alert("Now the book is free. Go take it. But remember to RETURN it.")
            this.setState({
                scannedBookID : '',
                scannedStudentID : ''
            })
        }
checkStudentEligibilityForBookIssue = async () => {
const studentRef = await db.collection("students").where("studentId", "==", this.state.scannedStudentID).get()
var isStudentFree = ''
if(studentRef.docs.length === 0){
this.setState({
    scannedBookID : '',
    scannedStudentID : '',
})
isStudentFree = false
Alert.alert("This student ID isn't there, FOOL!!")
}
else{
    studentRef.docs.map((doc) => {
        var student = doc.data();
        if(student.bookFree < 2){
isStudentFree = true
        }
        else{
            isStudentFree = false;
            Alert.alert("You already have two. Why do you need more, FOOL!!")
            this.setState({
                scannedStudentID : '',
                scannedBookID : '',
            })
        }
    })
}
return isStudentFree
} 
checkStudentEligibilityForReturn = async () => {
var transRef = await db.collection("trans").where("bookId", "==", this.state.scannedBookID).limit(1).get()
var isStudentFree = ""
transRef.docs.map((doc) => {
    var lastBookTrans = doc.data();
    if(lastBookTrans.studentId === this.state.scannedStudentId){
isStudentFree = true
    }
    else{
        isStudentFree = false;
        Alert.alert("This book ain't yours, FOOL!!")
        this.setState({
            scannedBookID : '',
            scannedStudentID : '',
        })
    }
})
return isStudentFree
}
checkBookEligibility = async () => {
    var bookRef = await db.collection("books").where("bookId", "==", this.state.scannedBookID).get()
var transType = ""
if(bookRef.docs.length == 0){
    transType = false
}
else{
bookRef.docs.map((doc) => {
    var book = doc.data();
    if(book.bookFree){

       transType = 'issued'
    }
    else{
     transType = 'return'   
    }
})
}
return transType
}
handleTrans = async() => {
var transType = await this.checkBookEligibility();
if(!transType){
Alert.alert("Book doesn't isn't here, FOOL!!")
this.setState({
    scannedBookID : '',
    scannedStudentID : '',    
})
}
else if(transType === "issue"){
var isStudentFree = await this.checkStudentEligibilityForBookIssue();
if(isStudentFree){
this.initiateBookIssue()
Alert.alert("There now you have it, FOOL!!")
}
}
else{
    var isStudentFree = await this.checkStudentEligibilityForReturn();
    if(isStudentFree){
        this.initiateBookReturn()
        Alert.alert("There you gave it back, FOOL!!")
} 
}
var transMessage = null;

db.collection("books").doc(this.state.scannedBookID).get()

.then((doc) => {
  //  console.log(doc.data())
  var book = doc.data()
  if(book.bookFree){
      this.initiateBookIssue()
      transMessage = "bookIssue"
      ToastAndroid.show(transMessage,ToastAndroid.SHORT)
  }
  else{
      this.initiateBookReturn()
      transMessage = "bookReturn"
      ToastAndroid.show(transMessage,ToastAndroid.SHORT)
    }
})
this.setState({
    transMessage : transMessage
})

}
 

render() {
    const hasCameraPermissions = this.state.hasCameraPermissions;
    const scanned = this.state.scanned;
    const buttonState = this.state.buttonState;

    if (buttonState !== "normal" && hasCameraPermissions){
      return(
        <BarCodeScanner
          onBarCodeScanned={scanned ? undefined : this.handleBarCodeScanned}
          style={StyleSheet.absoluteFillObject}
        />
      );
    }
else if(buttonState === "normal"){
return(
    <KeyboardAvoidingView style = {styles.container} behavior = "padding" enabled>
<View style = {styles.container}>
    <View>
    <Image
    source = {require("../assets/booklogo.jpg")}
    style = {{width : 200, height : 200}}
    />  
     <Text style = {{textAlign : 'center', fontSize : 30}}>
         W.I.L.Y
     </Text>
    </View>
    <View style = {styles.inputView}>
        <TextInput style = {styles.InputBox}
        placeholder = "Book ID"
        onChangeText = {text => this.setState ({scannedBookID : text })}
        value = {this.state.scannedBookID}
        />
        <TouchableOpacity style = {styles.scanButton}
        onPress = {() => {
            this.getCameraPermissions("bookID")
        }}>
<Text style = {styles.buttonText}>
    SCAN
</Text>
        </TouchableOpacity>
    </View>
    <View style = {styles.inputView}>
<TextInput style = {styles.InputBox}
placeholder = "Student ID"
onChangeText = {text => this.setState ({scannedStudentID : text})}
        value = {this.state.scannedStudentID}/>
            <TouchableOpacity style = {styles.scanButton}
        onPress = {() => {
            this.getCameraPermissions("studentID")
        }}>
           
            <Text style = {styles.buttonText}>
    SCAN
</Text>
</TouchableOpacity>  
    </View>
    <Text style = {styles.transAlert}>
        {this.state.transMessage}
    </Text>
    <TouchableOpacity style = {styles.submitButton}
    onPress = {async() => {
       var transMessage= await this.handleTrans(); 
       this.setState({
           scannedBookID : '',
           scannedStudentID : '',
       })
    }}>
        <Text style = {styles.submitButtonText}>
        Submit
        </Text>
    </TouchableOpacity>
</View>
</KeyboardAvoidingView>
    )
}
    }
}

const styles = StyleSheet.create({
    container : {
        flex : 1,
        justifyContent : 'center',
        alignItems : 'center',
    },
    displayText : {
        fontSize : 15,
        textDecorationLine : 'underline',
    },
    scanButton : {
        backgroundColor : 'lightblue',
        padding : 10,
        margin : 10
    },
    buttonText : {
        fontSize : 20,
        textAlign : 'center',
        marginTop : 10,
    },
    InputBox : {
        width : 200,
        height : 40,
        borderWidth : 1.5,
        fontSize : 20
    },
    scannedButton : {
        backgroundColor : 'lightblue',
        width : 50,
        borderWidth : 1.5,

    },
    submitButton : {
        backgroundColor : 'red',
        width : 100,
        height : 50,
    },
    submitButtonText : {
    textAlign : 'center',
    fontSize : 20,
    color : 'white',
    fontWeight : 'bold',
    padding : 10
    }
})