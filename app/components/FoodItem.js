import React from 'react';
import { StyleSheet, View, TouchableOpacity, Image, Text, Dimensions } from 'react-native';

import colors from '../config/colors';
import spacing from '../config/spacing';

const { width } = Dimensions.get('window');
const itemWidth = width / 2 - spacing * 3;

function FoodItem(props) {

    return (
        <View style={styles.itemContainer}>
            <TouchableOpacity style={styles.item} onPress={() => { props.openItemDetails(props.item) }}>
                <Image source={{ uri: props.image }} style={styles.itemImg} />
                <Text style={styles.itemName}>{props.name}</Text>
                <Text style={styles.itemCategory}>{props.tag}</Text>
                <View style={styles.txtContainer}>
                    <Text style={styles.itemPrice}>Rs.10</Text>
                    <Text style={styles.itemQuantity}>{`x${props.quantity}`}</Text>
                </View>
            </TouchableOpacity>
        </View >

        // <View style={styles.itemContainer}>
        //     <TouchableOpacity style={styles.item} onPress={() => { props.openItemDetails(props.item) }}>
        //         <View style={styles.itemBox}>
        //             <Image source={{ uri: props.image }} style={styles.itemImg} />
        //         </View>
        //         <View style={styles.itemBox}>
        //             <Text style={styles.itemName}>{props.name}</Text>
        //             <Text style={styles.itemCategory}>{props.tag}</Text>
        //             <Text style={styles.itemQuantity}>{`x${props.quantity}`}</Text>
        //             <Text style={styles.itemPrice}>Rs. 10</Text>
        //         </View>
        //     </TouchableOpacity>
        // </View>
    );
}

const styles = StyleSheet.create({
    itemContainer: {
        width: itemWidth,
        borderRadius: spacing * 2,
        borderBottomLeftRadius: spacing * 2.2,
        borderBottomRightRadius: spacing * 2.2,
        elevation: spacing * 2,
        backgroundColor: colors.white,
        alignItems: 'center',
        marginVertical: spacing * 1.2,
        elevation: spacing * 2,
        shadowColor: colors.darkLight
    },
    item: {
        width: itemWidth,
        marginBottom: spacing * 1.6
    },
    itemImg: {
        width: "100%",
        height: itemWidth + spacing * 1.5,
        borderRadius: spacing * 2,
        alignSelf: 'center',
        resizeMode: 'cover'
    },
    itemName: {
        fontSize: spacing * 1.53,
        fontWeight: "700",
        color: colors.dark,
        marginTop: spacing * 1.1,
        marginLeft: spacing * 1.2
    },
    itemCategory: {
        fontSize: spacing * 1.3,
        color: colors.gray,
        marginLeft: spacing * 1.2,
        top: -1
    },
    txtContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: spacing * 0.5
    },
    itemPrice: {
        fontSize: spacing * 1.35,
        fontWeight: "700",
        color: colors.green,
        marginTop: spacing * 0.1,
        marginLeft: spacing * 1.35
    },
    itemQuantity: {
        fontSize: spacing * 1.46,
        fontWeight: "700",
        color: colors.darkRed,
        marginTop: spacing * 0.1,
        marginRight: spacing * 1.7
    }

    // itemContainer: {
    //     width: '100%',
    //     borderRadius: spacing,
    //     marginVertical: spacing * 1.2,
    //     elevation: spacing * 2,
    //     backgroundColor: colors.white
    // },
    // item: {
    //     flexDirection: 'row',
    // },
    // itemImg: {
    //     width: spacing * 13,
    //     height: spacing * 13,
    //     borderRadius: spacing,
    //     resizeMode: 'cover'
    // },
    // itemName: {
    //     fontSize: spacing * 1.75,
    //     fontWeight: "700",
    //     color: colors.black,
    //     marginTop: spacing * 1.9,
    //     marginLeft: spacing * 1.4
    // },
    // itemCategory: {
    //     fontSize: spacing * 1.5,
    //     color: colors.gray,
    //     marginLeft: spacing * 1.4,
    //     top: -2
    // },
    // itemQuantity: {
    //     fontSize: spacing * 1.5,
    //     fontWeight: "700",
    //     color: colors.gray,
    //     marginTop: spacing * 0.1,
    //     marginLeft: spacing * 1.5
    // },
    // itemPrice: {
    //     fontSize: spacing * 1.5,
    //     fontWeight: "700",
    //     color: colors.darkRed,
    //     marginTop: spacing * 1.15,
    //     marginLeft: spacing * 1.5
    // }
})

export default FoodItem;