import React, { useState } from 'react';
import { StyleSheet, View, TextInput, Keyboard, TouchableOpacity } from 'react-native';
import { Feather, Entypo } from '@expo/vector-icons';

import colors from '../config/colors';
import spacing from '../config/spacing';

function SearchBar(props) {
    const [searchFocus, setSearchFocus] = useState(false);

    const keyboardHideListener = Keyboard.addListener('keyboardDidHide', () => {
        Keyboard.dismiss();
        setSearchFocus(false);
    });

    return (
        <View style={styles.searchBar}>
            <Feather name="search" size={22} color={searchFocus ? colors.red : colors.gray} style={{ top: 2, marginLeft: spacing * 0.3 }} />
            <TextInput placeholder='Search...' placeholderTextColor={colors.gray} style={styles.searchBarInput} onFocus={() => {
                setSearchFocus(true);
            }} onChangeText={(text) => { props.setSearch(text) }} value={props.search} />
            {props.search &&
                <TouchableOpacity style={{ top: 2.9, right: spacing * 3.5, height: 25, width: 30 }} onPress={() => { props.setSearch('') }}>
                    <Entypo name="cross" size={22} color={colors.whiteSmoke} />
                </TouchableOpacity>}
        </View>
    );
}

const styles = StyleSheet.create({
    searchBar: {
        flexDirection: "row",
        backgroundColor: colors.light,
        marginVertical: spacing * 3,
        marginTop: spacing * 2.1,
        padding: spacing * 1.2,
        borderRadius: spacing
    },
    searchBarInput: {
        color: colors.gray,
        fontSize: spacing * 1.5,
        marginLeft: spacing * 1.2,
        width: '90%',
        paddingRight: spacing
    }
})

export default SearchBar;