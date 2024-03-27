import React from 'react';
import { StyleSheet, Text, ScrollView, TouchableOpacity, View } from 'react-native';

import colors from '../config/colors';
import spacing from '../config/spacing';
import data from '../config/data';

function Categories(props) {
    return (
        <View style={{ marginBottom: spacing }}>
            <ScrollView horizontal style={{ marginLeft: spacing, top: -3 }} showsHorizontalScrollIndicator={false}>
                {data.map((category, index) => (
                    <TouchableOpacity style={[styles.category, props.activeCategory === index && { backgroundColor: colors.primary }]}
                        key={index} onPress={() => props.setActiveCategory(index)}>
                        <Text style={[styles.categoryText, props.activeCategory === index && {
                            color: colors.white,
                            fontWeight: "500",
                            fontSize: spacing * 1.6,
                        }
                        ]}>
                            {category.title}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    category: {
        flex: 1,
        marginRight: spacing * 1.4,
        marginBottom: spacing * 0.4,
        padding: spacing,
        paddingHorizontal: spacing * 1.3,
        borderRadius: spacing * 5,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: colors.light
    },
    categoryText: {
        fontSize: spacing * 1.6,
        fontWeight: "500",
        color: colors.gray
    }
})

export default Categories;