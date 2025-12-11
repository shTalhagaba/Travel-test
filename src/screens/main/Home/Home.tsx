import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  StyleSheet,
  Alert,
  Modal,
} from "react-native";
import { launchImageLibrary } from "react-native-image-picker";
import Toast from "react-native-toast-message";
import { supabase } from "../../../utils/supabaseClient";
import Colors from "../../../utils/Colors.utils";
import { moderateScale } from "react-native-size-matters";
import * as FileSystem from "react-native-fs";
import { Buffer } from "buffer";

export default function HomeScreen() {
  const [posts, setPosts] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [selectedMedia, setSelectedMedia] = useState<any>(null);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  };

  const showToast = (type: "success" | "error", message: string) => {
    Toast.show({ type, text1: message, position: "top" });
  };

  const pickMedia = async () => {
    const user = await getCurrentUser();
    if (!user) {
      showToast("error", "Please login to upload");
      return;
    }

    launchImageLibrary(
      {
        mediaType: "mixed",
        quality: 0.8,
        includeBase64: false,
        selectionLimit: 1,
      },
      (response) => {
        if (response.didCancel || response.errorCode) return;
        const asset = response.assets?.[0];
        if (asset) {
          setSelectedMedia(asset);
          setPreviewUri(asset?.uri);
        }
      }
    );
  };

  const uploadMedia = async () => {
    if (!selectedMedia) return;

    const user = await getCurrentUser();
    if (!user) return;

    setUploading(true);
    try {
      const { uri, type, fileName } = selectedMedia;

      const base64 = await FileSystem.readFile(uri, "base64");
      const fileBytes = Buffer.from(base64, "base64");

      const ext = fileName?.split(".").pop() || (type?.includes("video") ? "mp4" : "jpg");
      const filePath = `${user.id}/${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("social")
        .upload(filePath, fileBytes, {
          contentType: type || "image/jpeg",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from("social").getPublicUrl(filePath);

      const { error: dbError } = await supabase.from("posts").insert({
        user_id: user.id,
        media_url: publicUrl,
        media_type: type?.startsWith("video") ? "video" : "image",
      });

      if (dbError) throw dbError;

      showToast("success", "Posted successfully!");
      setPreviewUri(null);
      setSelectedMedia(null);
      fetchPosts();
    } catch (err: any) {
      console.log("Upload error:", err);
      showToast("error", err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const fetchPosts = async () => {
    try {
      setRefreshing(true);
      const { data, error } = await supabase
        .from("posts")
        .select(`
          id,
          user_id,
          media_url,
          media_type,
          created_at,
          profiles ( username, avatar_url )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (err: any) {
      showToast("error", "Failed to load posts");
    } finally {
      setRefreshing(false);
    }
  };

  const deletePost = (postId: string, mediaUrl: string, userId: string) => {
    Alert.alert("Delete Post", "This action cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const fileName = mediaUrl.split("/").pop()?.split("?")[0] || "";
            const filePath = `${userId}/${fileName}`;
            await supabase.storage.from("social").remove([filePath]);
            await supabase.from("posts").delete().eq("id", postId);
            showToast("success", "Post deleted");
            fetchPosts();
          } catch {
            showToast("error", "Failed to delete");
          }
        },
      },
    ]);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <Text style={styles.username}>
          {item.profiles?.username || `User_${item.user_id.slice(0, 6)}`}
        </Text>
        <TouchableOpacity onPress={() => deletePost(item.id, item.media_url, item.user_id)}>
          <Text style={styles.deleteText}>Delete</Text>
        </TouchableOpacity>
      </View>

      {item.media_type === "image" ? (
        <Image source={{ uri: item.media_url }} style={styles.postImage} resizeMode="cover" />
      ) : (
        <View style={styles.videoPlaceholder}>
          <Text style={styles.videoIcon}>Video</Text>
          <Text style={styles.videoText}>Video post</Text>
        </View>
      )}

      <View style={styles.postFooter}>
        <Text style={styles.mediaType}>{item.media_type}</Text>
        <Text style={styles.date}>
          {new Date(item.created_at).toLocaleDateString()}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Media Feed</Text>

      <TouchableOpacity style={styles.uploadBtn} onPress={pickMedia}>
        <Text style={styles.uploadText}>Upload Photo or Video</Text>
      </TouchableOpacity>

      <Modal visible={!!previewUri} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.previewContainer}>
            {selectedMedia?.type?.startsWith("video") ? (
              <View style={styles.videoPlaceholder}>
                <Text style={styles.videoIcon}>Video</Text>
                <Text style={styles.videoText}>Video Selected</Text>
              </View>
            ) : (
              <Image source={{ uri: previewUri }} style={styles.previewImage} resizeMode="contain" />
            )}

            <View style={styles.previewActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => {
                  setPreviewUri(null);
                  setSelectedMedia(null);
                }}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.confirmBtn, uploading && styles.disabledBtn]}
                onPress={uploadMedia}
                disabled={uploading}
              >
                {uploading ? (
                  <ActivityIndicator color={Colors.WHITE} />
                ) : (
                  <Text style={styles.confirmText}>Upload Now</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <View style={styles.statsBar}>
        <Text style={styles.statsText}>Total Posts: {posts.length}</Text>
        <TouchableOpacity onPress={fetchPosts}>
          <Text style={styles.refreshText}>Refresh</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshing={refreshing}
        onRefresh={fetchPosts}
        ListEmptyComponent={
          !refreshing && (
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>No posts yet</Text>
              <Text style={styles.emptySubtitle}>Be the first to upload!</Text>
            </View>
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND,
    padding: moderateScale(16),
  },
  title: {
    fontSize: moderateScale(28),
    fontWeight: "bold",
    color: Colors.PRIMARY,
    textAlign: "center",
    marginVertical: moderateScale(10),
  },
  uploadBtn: {
    backgroundColor: Colors.PRIMARY,
    padding: moderateScale(16),
    borderRadius: moderateScale(12),
    alignItems: "center",
    marginBottom: moderateScale(20),
  },
  uploadText: {
    color: Colors.WHITE,
    fontSize: moderateScale(16),
    fontWeight: "600",
  },
  statsBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: moderateScale(15),
    paddingHorizontal: moderateScale(5),
  },
  statsText: {
    fontSize: moderateScale(14),
    color: Colors.PLACEHOLDER,
    fontWeight: "500",
  },
  refreshText: {
    color: Colors.PRIMARY,
    fontWeight: "600",
  },
  list: {
    paddingBottom: moderateScale(30),
  },

  postCard: {
    backgroundColor: Colors.WHITE,
    borderRadius: moderateScale(16),
    marginBottom: moderateScale(18),
    overflow: "hidden",
    elevation: moderateScale(5),
    shadowColor: Colors.BLACK,
    shadowOffset: { width: 0, height: moderateScale(4) },
    shadowOpacity: 0.1,
    shadowRadius: moderateScale(8),
  },
  postHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: moderateScale(14),
    backgroundColor: Colors.BACKGROUND,
  },
  username: {
    fontSize: moderateScale(15),
    fontWeight: "600",
    color: Colors.PLACEHOLDER,
  },
  deleteText: {
    color: Colors.ERROR,
    fontWeight: "bold",
  },
  postImage: {
    width: "100%",
    height: moderateScale(320),
  },
  videoPlaceholder: {
    width: "100%",
    height: moderateScale(320),
    backgroundColor: Colors.BLACK,
    justifyContent: "center",
    alignItems: "center",
  },
  videoIcon: {
    fontSize: moderateScale(50),
    color: Colors.WHITE,
  },
  videoText: {
    color: Colors.WHITE,
    marginTop: moderateScale(10),
    fontSize: moderateScale(16),
  },
  postFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: moderateScale(14),
    backgroundColor: Colors.BACKGROUND,
  },
  mediaType: {
    fontSize: moderateScale(13),
    color: Colors.PLACEHOLDER,
    textTransform: "capitalize",
  },
  date: {
    fontSize: moderateScale(12),
    color: Colors.PLACEHOLDER,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.BLACK,
    justifyContent: "center",
    alignItems: "center",
  },
  previewContainer: {
    width: "90%",
    backgroundColor: Colors.WHITE,
    borderRadius: moderateScale(16),
    overflow: "hidden",
  },
  previewImage: {
    width: "100%",
    height: moderateScale(400),
  },
  previewActions: {
    flexDirection: "row",
    padding: moderateScale(20),
    justifyContent: "space-between",
  },
  cancelBtn: {
    backgroundColor: Colors.GRAY,
    paddingHorizontal: moderateScale(30),
    paddingVertical: moderateScale(12),
    borderRadius: moderateScale(10),
  },
  cancelText: {
    fontWeight: "600",
    color: Colors.PLACEHOLDER,
  },
  confirmBtn: {
    backgroundColor: Colors.PRIMARY,
    paddingHorizontal: moderateScale(40),
    paddingVertical: moderateScale(12),
    borderRadius: moderateScale(10),
  },
  confirmText: {
    color: Colors.WHITE,
    fontWeight: "600",
  },
  disabledBtn: {
    opacity: 0.7,
  },

  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: moderateScale(100),
  },
  emptyTitle: {
    fontSize: moderateScale(20),
    fontWeight: "600",
    color: Colors.PLACEHOLDER,
  },
  emptySubtitle: {
    fontSize: moderateScale(14),
    color: Colors.GRAY,
    marginTop: moderateScale(8),
  },
});