import React from 'react';
import { View, Image, Text } from 'react-native';

import FoodItem from './FoodItem';

import colors from '../config/colors';
import spacing from '../config/spacing';

function Food(props) {

    const openItemDetails = (item) => {
        props.navigation.navigate('item', item);
    }

    return (
        <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", marginBottom: spacing * 5.5 }}>
            {props.data
                .filter((item) => {
                    if (props.activeCategory === 0) return true;
                    if (props.activeCategory === 1) return item.selectedCategory === 'open';
                    if (props.activeCategory === 2) return item.selectedCategory === 'can';
                    if (props.activeCategory === 3) return item.selectedCategory === 'drink';
                    return false;
                })
                .filter((item) => {
                    if (!props.searchText) return true;
                    return item.title.toLowerCase().includes(props.searchText.toLowerCase());
                })
                .length > 0 ? (
                props.data
                    .filter((item) => {
                        if (props.activeCategory === 0) return true;
                        if (props.activeCategory === 1) return item.selectedCategory === 'open';
                        if (props.activeCategory === 2) return item.selectedCategory === 'can';
                        if (props.activeCategory === 3) return item.selectedCategory === 'drink';
                        return false;
                    })
                    .filter((item) => {
                        if (!props.searchText) return true;
                        return item.title.toLowerCase().includes(props.searchText.toLowerCase());
                    })
                    .map((item) => (
                        <FoodItem navigation={props.navigation} key={item.imageURL} image={item.imageURL} name={item.title} price={item.price} quantity={item.quantity} tag={item.selectedTag} item={item} openItemDetails={openItemDetails} />
                    ))
            ) : (!props.loading &&
                <View style={{ width: '100%', justifyContent: 'center', alignItems: 'center', marginTop: spacing * 3 }}>
                    <Image source={require('../assets/not-found.jpg')} style={{ width: 220, height: 220, left: -spacing * 0.7 }} />
                    <Text style={{ fontSize: 15.5, fontWeight: '700', color: colors.gray, top: -1 }}>Sorry, no items found!</Text>
                </View>
            )}
        </View>
    );
}

export default Food;