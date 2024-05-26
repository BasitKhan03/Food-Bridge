import React, { useState, useEffect } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { StyleSheet, View, Text, TouchableOpacity, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  AntDesign,
  MaterialCommunityIcons,
  Feather,
  Ionicons,
  MaterialIcons,
} from "@expo/vector-icons";

import DrawerView from "../components/DrawerView";
import SubHeaderNav from "../components/SubHeaderNav";
import Spinner from "../components/Spinner";

import { collection, getDocs, query, where } from "firebase/firestore";
import { db, auth } from "../firebase/FirebaseConfig";
import { onAuthStateChanged } from "firebase/auth";

import colors from "../config/colors";
import spacing from "../config/spacing";

export default function ProfileScreen({ navigation }) {
  const [userLoggedUid, setUserLoggedUid] = useState(null);
  const [userData, setUserData] = useState([]);
  const [userLevel, setUserLevel] = useState();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState(true);
  const [allItemsCount, setAllItemsCount] = useState(0);
  const [currentItemsCount, setCurrentItemsCount] = useState(0);
  const [expiredItemsCount, setExpiredItemsCount] = useState(0);

  useEffect(() => {
    const checkLogin = () => {
      onAuthStateChanged(auth, (user) => {
        if (user) {
          setUserLoggedUid(user.uid);
        } else {
          setUserLoggedUid([]);
          console.log("No user logged in (Profile)");
        }
      });
    };

    checkLogin();
  }, []);

  useEffect(() => {
    const getUserData = async () => {
      setLoading(true);
      const docRef = collection(db, "userData");
      const q = query(docRef, where("uid", "==", userLoggedUid));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        querySnapshot.forEach((doc) => {
          setUserData(doc.data());
          setLoading(false);
        });
      }
    };
    getUserData();
  }, [userLoggedUid]);

  useEffect(() => {
    const getUserLevel = async () => {
      const docRef = collection(db, "userScores");
      const q = query(docRef, where("uid", "==", userLoggedUid));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        querySnapshot.forEach((doc) => {
          const userData = doc.data();
          const userLevel = userData.level;

          setUserLevel(userLevel);
        });
      }
    };

    getUserLevel();
  }, [userLoggedUid]);

  useEffect(() => {
    const readData = async () => {
      const myFoodItemCollectionRef = collection(db, "myFoodItem");

      const querySnapshot = await getDocs(
        query(myFoodItemCollectionRef, where("userId", "==", userLoggedUid))
      );

      const allItemsCount = querySnapshot.size;
      const formattedAllItemsCount = allItemsCount.toString().padStart(2, "0");

      setAllItemsCount(formattedAllItemsCount);
    };

    readData();
  }, [userLoggedUid]);

  useEffect(() => {
    const readData = async () => {
      const myFoodItemCollectionRef = collection(db, "myFoodItem");
      const currentDate = new Date();

      const querySnapshot = await getDocs(
        query(myFoodItemCollectionRef, where("userId", "==", userLoggedUid))
      );

      const currentItemsCount = querySnapshot.docs.reduce((count, doc) => {
        const foodItem = doc.data();
        const listingDate = foodItem.listingDate.toDate();
        const listingPeriod = foodItem.listingPeriod;

        const expirationDate = new Date(
          listingDate.getTime() + listingPeriod * 24 * 60 * 60 * 1000
        );

        if (expirationDate >= currentDate) {
          return count + 1;
        }
        return count;
      }, 0);

      const formattedCurrentItemsCount = currentItemsCount
        .toString()
        .padStart(2, "0");
      setCurrentItemsCount(formattedCurrentItemsCount);
    };

    readData();
  }, [userLoggedUid]);

  useEffect(() => {
    const readData = async () => {
      const myFoodItemCollectionRef = collection(db, "myFoodItem");
      const currentDate = new Date();

      const querySnapshot = await getDocs(
        query(myFoodItemCollectionRef, where("userId", "==", userLoggedUid))
      );

      const expiredItems = querySnapshot.docs.reduce((count, doc) => {
        const foodItem = doc.data();
        const listingDate = foodItem.listingDate.toDate();
        const listingPeriod = foodItem.listingPeriod;

        const expirationDate = new Date(
          listingDate.getTime() + listingPeriod * 24 * 60 * 60 * 1000
        );

        if (expirationDate < currentDate) {
          return count + 1;
        }
        return count;
      }, 0);

      const formattedExpiredItemsCount = expiredItems
        .toString()
        .padStart(2, "0");
      setExpiredItemsCount(formattedExpiredItemsCount);
    };

    readData();
  }, [userLoggedUid]);

  useFocusEffect(
    React.useCallback(() => {
      setProfile(true);
    }, [])
  );

  return (
    <>
      <DrawerView style={styles.drawerView}>
        <LinearGradient
          colors={["rgba(163, 230, 255, 0.3)", "#ffffff"]}
          start={{ x: 0.1, y: 0.1 }}
          end={{ x: 0.9, y: 0.9 }}
          style={{ flex: 1 }}
        >
          <View>
            <SubHeaderNav navigation={navigation} title={"My Profile"} />
          </View>

          {loading && (
            <View
              style={{
                backgroundColor: colors.white,
                width: "100%",
                height: "90%",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <View style={{ marginTop: -spacing * 13 }}>
                <Spinner />
              </View>
            </View>
          )}

          {!loading && (
            <View style={styles.container}>
              <View style={styles.userImageBorder}>
                <View style={styles.userImage}>
                  {userData.imageURL === "" && (
                    <AntDesign name="user" size={38} color={colors.primary} />
                  )}
                  {userData.imageURL && (
                    <Image
                      style={{
                        zIndex: 1000,
                        width: 95,
                        height: 95,
                        borderRadius: spacing * 5,
                      }}
                      source={{ uri: userData.imageURL }}
                    />
                  )}
                </View>
              </View>

              <View style={styles.profile}>
                <View style={styles.userDetails}>
                  <Text
                    style={{
                      fontSize: 18.5,
                      fontWeight: "700",
                      color: colors.black,
                    }}
                  >
                    {userData.name}
                  </Text>
                  <Text
                    style={{
                      fontSize: 14.5,
                      fontWeight: "400",
                      color: colors.darkGray,
                      top: 1,
                    }}
                  >
                    Level {userLevel}
                  </Text>
                </View>

                <View
                  style={{
                    width: "90%",
                    marginTop: spacing * 1.6,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-around",
                    marginBottom: spacing * 0.8,
                    marginLeft: -4,
                  }}
                >
                  <TouchableOpacity
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    onPress={() => setProfile(true)}
                  >
                    <MaterialCommunityIcons
                      name="account-details-outline"
                      size={22}
                      color={profile ? colors.darkLight : colors.gray}
                    />
                    <Text
                      style={{
                        fontSize: 14.5,
                        fontWeight: "700",
                        marginLeft: spacing,
                        color: profile ? colors.dark : colors.gray,
                      }}
                    >
                      Personal Info
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    onPress={() => setProfile(false)}
                  >
                    <MaterialIcons
                      name="list-alt"
                      size={21.5}
                      color={!profile ? colors.darkLight : colors.gray}
                    />
                    <Text
                      style={{
                        fontSize: 14.5,
                        fontWeight: "700",
                        marginLeft: spacing * 0.7,
                        color: !profile ? colors.dark : colors.gray,
                      }}
                    >
                      Overview
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.card}>
                {profile && (
                  <View style={styles.profileDetails}>
                    <View style={styles.information}>
                      <View style={{ flexDirection: "row" }}>
                        <Feather name="mail" size={18} color={colors.primary} />
                        <Text style={styles.infoHeading}>Email address</Text>
                      </View>
                      <Text style={styles.infoContent}>{userData.email}</Text>
                    </View>

                    <View style={styles.information}>
                      <View style={{ flexDirection: "row" }}>
                        <Feather
                          name="phone"
                          size={17}
                          color={colors.primary}
                        />
                        <Text style={styles.infoHeading}>Phone number</Text>
                      </View>
                      <Text style={[styles.infoContent, { fontSize: 14 }]}>
                        {userData.phone}
                      </Text>
                    </View>

                    <View style={styles.information}>
                      <View style={{ flexDirection: "row" }}>
                        <Ionicons
                          name="location-outline"
                          size={21}
                          color={colors.primary}
                          style={{ marginLeft: -spacing * 0.2 }}
                        />
                        <Text
                          style={[
                            styles.infoHeading,
                            { marginLeft: spacing * 0.5 },
                          ]}
                        >
                          Address
                        </Text>
                      </View>
                      <Text
                        style={[
                          styles.infoContent,
                          {
                            marginTop: -1,
                            fontSize: 14,
                            marginLeft: spacing * 2.72,
                          },
                        ]}
                      >
                        {userData.address}, {userData.city}
                      </Text>
                    </View>

                    <View style={styles.information}>
                      <View style={{ flexDirection: "row" }}>
                        <AntDesign
                          name="calendar"
                          size={18}
                          color={colors.primary}
                        />
                        <Text style={styles.infoHeading}>Date joined</Text>
                      </View>
                      <Text style={[styles.infoContent, { fontSize: 14 }]}>
                        {userData.date &&
                          new Date(userData.date.toDate()).toLocaleDateString(
                            "en-US",
                            { month: "short", day: "numeric", year: "numeric" }
                          )}
                      </Text>
                    </View>
                  </View>
                )}

                {!profile && (
                  <View style={styles.listingDetails}>
                    <View
                      style={{
                        width: "90%",
                        marginTop: spacing * 0.5,
                        flexDirection: "row",
                        justifyContent: "space-around",
                      }}
                    >
                      <View
                        style={{
                          width: 142,
                          height: 105,
                          backgroundColor: colors.white,
                          elevation: spacing * 0.7,
                          shadowColor: colors.whiteSmoke,
                          alignItems: "center",
                          borderRadius: spacing * 0.8,
                        }}
                      >
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            marginTop: spacing * 2,
                          }}
                        >
                          <Feather
                            name="box"
                            size={19}
                            color={colors.primary}
                          />
                          <Text style={[styles.infoHeading, { left: -2 }]}>
                            Total items
                          </Text>
                        </View>
                        <Text
                          style={{
                            fontSize: 15.5,
                            fontWeight: "600",
                            color: colors.darkBlue2,
                            marginTop: spacing * 1.6,
                            marginLeft: spacing,
                          }}
                        >
                          {allItemsCount}
                        </Text>
                      </View>

                      <View
                        style={{
                          width: 142,
                          height: 105,
                          backgroundColor: colors.white,
                          elevation: spacing * 0.7,
                          shadowColor: colors.whiteSmoke,
                          alignItems: "center",
                          borderRadius: spacing * 0.8,
                        }}
                      >
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            marginTop: spacing * 2,
                          }}
                        >
                          <Feather
                            name="target"
                            size={16.5}
                            color={colors.primary}
                          />
                          <Text style={[styles.infoHeading, { left: -2 }]}>
                            Current listings
                          </Text>
                        </View>
                        <Text
                          style={{
                            fontSize: 15.5,
                            fontWeight: "600",
                            color: colors.darkBlue2,
                            marginTop: spacing * 1.6,
                            marginLeft: spacing,
                          }}
                        >
                          {currentItemsCount}
                        </Text>
                      </View>
                    </View>

                    <View
                      style={{
                        width: "90%",
                        marginTop: spacing * 1.5,
                        flexDirection: "row",
                        justifyContent: "space-around",
                      }}
                    >
                      <View
                        style={{
                          width: 142,
                          height: 105,
                          backgroundColor: colors.white,
                          elevation: spacing * 0.7,
                          shadowColor: colors.whiteSmoke,
                          alignItems: "center",
                          borderRadius: spacing * 0.8,
                        }}
                      >
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            marginTop: spacing * 2,
                          }}
                        >
                          <AntDesign
                            name="CodeSandbox"
                            size={18}
                            color={colors.primary}
                          />
                          <Text style={styles.infoHeading}>Expired items</Text>
                        </View>
                        <Text
                          style={{
                            fontSize: 15.5,
                            fontWeight: "600",
                            color: colors.darkBlue2,
                            marginTop: spacing * 1.6,
                            marginLeft: spacing,
                          }}
                        >
                          {expiredItemsCount}
                        </Text>
                      </View>

                      <View
                        style={{
                          width: 142,
                          height: 105,
                          backgroundColor: colors.white,
                          elevation: spacing * 0.7,
                          shadowColor: colors.whiteSmoke,
                          alignItems: "center",
                          borderRadius: spacing * 0.8,
                        }}
                      >
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            marginTop: spacing * 2,
                          }}
                        >
                          <AntDesign
                            name="inbox"
                            size={21}
                            color={colors.primary}
                          />
                          <Text style={[styles.infoHeading, { left: -2 }]}>
                            Donated items
                          </Text>
                        </View>
                        <Text
                          style={{
                            fontSize: 15.5,
                            fontWeight: "600",
                            color: colors.darkBlue2,
                            marginTop: spacing * 1.6,
                            marginLeft: spacing,
                          }}
                        >
                          Na
                        </Text>
                      </View>
                    </View>
                  </View>
                )}
              </View>
            </View>
          )}
        </LinearGradient>
      </DrawerView>
    </>
  );
}

const styles = StyleSheet.create({
  drawerView: {
    flex: 1,
    backgroundColor: "#242D40",
    overflow: "hidden",
  },

  marginTop: {
    marginTop: spacing,
  },
  marginVertical: {
    marginVertical: spacing * 1.5,
  },
  marginBottom: {
    marginBottom: spacing * 1.5,
  },

  container: {
    width: "100%",
    height: "100%",
    justifyContent: "flex-end",
  },

  profile: {
    width: "90%",
    alignSelf: "center",
    marginTop: spacing * 3.5,
    alignItems: "center",
    marginBottom: spacing * 0.5,
    backgroundColor: colors.white,
    elevation: spacing,
    shadowColor: colors.whiteSmoke,
    top: spacing * 7,
    zIndex: 1000,
    borderRadius: spacing,
    paddingTop: spacing * 4.7,
    paddingBottom: spacing,
  },
  userImageBorder: {
    marginVertical: spacing / 1.5,
    width: 103,
    height: 103,
    borderRadius: spacing * 10,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    top: spacing * 15.5,
    zIndex: 1001,
    elevation: spacing,
    shadowColor: colors.whiteSmoke,
  },
  userImage: {
    width: 93,
    height: 93,
    borderRadius: spacing * 10,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  userDetails: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing * 1.1,
    marginBottom: spacing * 0.7,
  },

  card: {
    width: "100%",
    height: "75%",
    backgroundColor: colors.white,
    borderTopRightRadius: spacing * 1.5,
    borderTopLeftRadius: spacing * 1.5,
  },

  information: {
    width: "105%",
    alignSelf: "center",
    backgroundColor: colors.white,
    elevation: spacing * 0.5,
    shadowColor: colors.whiteSmoke,
    borderRadius: spacing * 0.8,
    paddingVertical: spacing * 1.4,
    paddingHorizontal: spacing * 2.1,
    marginBottom: spacing * 1.3,
  },
  profileDetails: {
    width: "80%",
    alignSelf: "center",
    marginTop: spacing * 9.1,
  },
  infoHeading: {
    fontSize: 13.5,
    fontWeight: "500",
    color: colors.gray,
    marginLeft: spacing * 0.7,
  },
  infoContent: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.darkBlue2,
    marginTop: spacing * 0.45,
    marginLeft: spacing * 2.85,
  },

  listingDetails: {
    marginTop: spacing * 9.1,
    width: "100%",
    height: "100%",
    alignItems: "center",
  },
});
