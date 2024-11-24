import { View, Text, Image } from 'react-native'
import React from 'react'
import { Colors } from '../../constants/Colors'

export default function Header() {
  return (
    <View style={{
        padding:10,
        paddingTop:0,
        backgroundColor:Colors.PRIMARY
    }}>
      <View>
        <Image source={require('./../../assets/images/Logo.png')}
        style={{
            width:100,
            height:100
        }}
        />
      </View>
    </View>
  )
}