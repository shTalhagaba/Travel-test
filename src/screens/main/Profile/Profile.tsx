import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { supabase } from "../../../utils/supabaseClient";
import Colors from "../../../utils/Colors.utils";
import { moderateScale, verticalScale } from "react-native-size-matters";
import Toast from "react-native-toast-message";
import { useNavigation } from "@react-navigation/native";

export default function ProfileScreen() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<any>();

  const showToast = (type: "success" | "error", message: string) => {
    Toast.show({ type, text1: message, position: "top" });
  };

  const fetchUserAndPosts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigation.replace("SignIn");
        return;
      }

      setUser(user);

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("username, avatar_url")
        .eq("id", user.id)
        .single();

      if (profileError && profileError.code !== "PGRST116") {
        console.log("Profile error:", profileError);
      }
      setProfile(profileData);

      const { data: postsData, error: postsError } = await supabase
        .from("posts")
        .select("id, media_url, media_type, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (postsError) throw postsError;
      setPosts(postsData || []);
    } catch (err: any) {
      showToast("error", err.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await supabase.auth.signOut();
          navigation.replace("SignIn");
        },
      },
    ]);
  };

  useEffect(() => {
    fetchUserAndPosts();
  }, []);

  const renderPost = ({ item }: { item: any }) => (
    <View style={styles.gridItem}>
      {item.media_type === "image" ? (
        <Image source={{ uri: item.media_url }} style={styles.gridImage} resizeMode="cover" />
      ) : (
        <View style={styles.videoGridItem}>
          <Text style={styles.videoIcon}>Video</Text>
        </View>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.PRIMARY} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Profile</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.profileCard}>
        <View style={styles.avatarContainer}>
          {profile?.Avatar_url ? (
            <Image source={{ uri: profile.avatar_url }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {profile?.username?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "U"}
              </Text>
            </View>
          )}
        </View>

        <Text style={styles.username}>
          {profile?.username || "Set a username"}
        </Text>
        <Text style={styles.email}>{user?.email}</Text>

        <View style={styles.stats}>
          <View style={styles.stat}>
            <Text style={styles.statNumber}>{posts.length}</Text>
            <Text style={styles.statLabel}>Posts</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statNumber}>—</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statNumber}>—</Text>
            <Text style={styles.statLabel}>Following</Text>
          </View>
        </View>
      </View>

      <View style={styles.postsHeader}>
        <Text style={styles.postsTitle}>Your Posts</Text>
      </View>

      {posts.length === 0 ? (
        <View style={styles.noPosts}>
          <Text style={styles.noPostsText}>No posts yet</Text>
          <Text style={styles.noPostsSub}>When you post, they'll appear here</Text>
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          renderItem={renderPost}
          numColumns={3}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.grid}
        />
      )}

      <Toast />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.WHITE,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.WHITE,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: moderateScale(16),
    borderBottomWidth: 1,
    borderColor: Colors.BACKGROUND,
  },
  title: {
    fontSize: moderateScale(20),
    fontWeight: "bold",
    color: Colors.TEXT,
  },
  logoutBtn: {
    padding: moderateScale(8),
  },
  logoutText: {
    color: Colors.ERROR,
    fontWeight: "600",
  },

  profileCard: {
    alignItems: "center",
    paddingVertical: moderateScale(30),
    borderBottomWidth: 8,
    borderColor: Colors.GRAY,
  },
  avatarContainer: {
    marginBottom: moderateScale(15),
  },
  avatar: {
    width: moderateScale(100),
    height: moderateScale(100),
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: moderateScale(100),
    height: moderateScale(100),
    borderRadius: 50,
    backgroundColor: Colors.PRIMARY,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: moderateScale(40),
    color: Colors.WHITE,
    fontWeight: "bold",
  },

  username: {
    fontSize: moderateScale(22),
    fontWeight: "bold",
    color: Colors.GRAY,
  },
  email: {
    fontSize: moderateScale(14),
    color: Colors.PLACEHOLDER,
    marginTop: 5,
  },

  stats: {
    flexDirection: "row",
    marginTop: moderateScale(20),
    gap: moderateScale(40),
  },
  stat: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: moderateScale(18),
    fontWeight: "bold",
  },
  statLabel: {
    fontSize: moderateScale(12),
    color: Colors.PLACEHOLDER,
  },

  editBtn: {
    marginTop: moderateScale(20),
    backgroundColor: Colors.BACKGROUND,
    paddingHorizontal: moderateScale(30),
    paddingVertical: moderateScale(10),
    borderRadius: moderateScale(8),
  },

  postsHeader: {
    padding: moderateScale(16),
    borderBottomWidth: 1,
    borderColor: Colors.GRAY,
  },
  postsTitle: {
    fontSize: moderateScale(16),
    fontWeight: "bold",
  },

  grid: {
    padding: moderateScale(2),
  },
  gridItem: {
    flex: 1 / 3,
    aspectRatio: 1,
    padding: moderateScale(10),
    borderWidth: 1,
    borderColor: Colors.GRAY,
  },
  gridImage: {
    width: "100%",
    height: "100%",
  },
  videoGridItem: {
    width: "100%",
    height: "100%",
    backgroundColor: Colors.BLACK,
    justifyContent: "center",
    alignItems: "center",
  },
  videoIcon: {
    fontSize: moderateScale(30),
    color: Colors.WHITE,
  },

  noPosts: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: moderateScale(40),
  },
  noPostsText: {
    fontSize: moderateScale(18),
    fontWeight: "600",
    color: Colors.GRAY,
  },
  noPostsSub: {
    fontSize: moderateScale(14),
    color: Colors.WHITE,
    marginTop: verticalScale(8),
  },
});
