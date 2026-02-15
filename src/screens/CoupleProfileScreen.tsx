/**
 * 情侣档案页面
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, CoupleProfile } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { updateUserProfile } from '../services/auth';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';

type CoupleProfileScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'CoupleProfile'
>;

interface Props {
  navigation: CoupleProfileScreenNavigationProp;
}

export const CoupleProfileScreen: React.FC<Props> = ({ navigation }) => {
  const { user, userProfile, refreshUserProfile } = useAuth();
  const [partnerName, setPartnerName] = useState(
    userProfile?.coupleProfile?.partnerName || ''
  );
  const [userNickname, setUserNickname] = useState(
    userProfile?.coupleProfile?.userNickname || ''
  );
  const [partnerNickname, setPartnerNickname] = useState(
    userProfile?.coupleProfile?.partnerNickname || ''
  );
  const [anniversaryDate, setAnniversaryDate] = useState(
    userProfile?.coupleProfile?.anniversaryDate || new Date().toISOString().split('T')[0]
  );
  const [relationshipStatus, setRelationshipStatus] = useState<
    'dating' | 'engaged' | 'married'
  >(userProfile?.coupleProfile?.relationshipStatus || 'dating');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!user) return;

    if (!partnerName || !userNickname || !partnerNickname) {
      Alert.alert('错误', '请填写所有必填字段');
      return;
    }

    setLoading(true);
    try {
      const coupleProfile: CoupleProfile = {
        partnerName,
        userNickname,
        partnerNickname,
        anniversaryDate,
        relationshipStatus,
      };

      await updateUserProfile(user.uid, { coupleProfile });
      await refreshUserProfile();
      Alert.alert('成功', '情侣档案已保存');
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('保存失败', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setAnniversaryDate(selectedDate.toISOString().split('T')[0]);
    }
  };

  return (
    <LinearGradient colors={['#FF69B4', '#87CEEB']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backText}>← 返回</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>情侣档案 💑</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.content}>
          <Text style={styles.description}>
            完善情侣档案，让AI生成更贴心的内容
          </Text>

          <View style={styles.form}>
            <View style={styles.inputCard}>
              <Text style={styles.label}>对方姓名 *</Text>
              <TextInput
                style={styles.input}
                value={partnerName}
                onChangeText={setPartnerName}
                placeholder="输入对方姓名"
                placeholderTextColor="#999"
                editable={!loading}
              />
            </View>

            <View style={styles.inputCard}>
              <Text style={styles.label}>你的昵称 *</Text>
              <TextInput
                style={styles.input}
                value={userNickname}
                onChangeText={setUserNickname}
                placeholder="例如：宝贝、亲爱的"
                placeholderTextColor="#999"
                editable={!loading}
              />
            </View>

            <View style={styles.inputCard}>
              <Text style={styles.label}>对方昵称 *</Text>
              <TextInput
                style={styles.input}
                value={partnerNickname}
                onChangeText={setPartnerNickname}
                placeholder="例如：老公、老婆"
                placeholderTextColor="#999"
                editable={!loading}
              />
            </View>

            <View style={styles.inputCard}>
              <Text style={styles.label}>纪念日</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowDatePicker(true)}
                disabled={loading}
              >
                <Text style={styles.dateText}>{anniversaryDate}</Text>
              </TouchableOpacity>
            </View>

            {showDatePicker && (
              <DateTimePicker
                value={new Date(anniversaryDate)}
                mode="date"
                display="default"
                onChange={handleDateChange}
              />
            )}

            <View style={styles.inputCard}>
              <Text style={styles.label}>关系状态</Text>
              <View style={styles.statusContainer}>
                {[
                  { value: 'dating', label: '恋爱中 💕' },
                  { value: 'engaged', label: '已订婚 💍' },
                  { value: 'married', label: '已婚 💒' },
                ].map((status) => (
                  <TouchableOpacity
                    key={status.value}
                    style={[
                      styles.statusButton,
                      relationshipStatus === status.value && styles.statusButtonActive,
                    ]}
                    onPress={() =>
                      setRelationshipStatus(status.value as 'dating' | 'engaged' | 'married')
                    }
                    disabled={loading}
                  >
                    <Text
                      style={[
                        styles.statusButtonText,
                        relationshipStatus === status.value &&
                          styles.statusButtonTextActive,
                      ]}
                    >
                      {status.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity
              style={[styles.saveButton, loading && styles.buttonDisabled]}
              onPress={handleSave}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.saveButtonText}>保存档案</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  backText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 60,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  description: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    opacity: 0.9,
  },
  form: {
    width: '100%',
  },
  inputCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    fontWeight: '600',
  },
  input: {
    fontSize: 16,
    color: '#2C3E50',
    paddingVertical: 4,
  },
  dateButton: {
    paddingVertical: 8,
  },
  dateText: {
    fontSize: 16,
    color: '#2C3E50',
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  statusButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: '#F8F9FA',
    marginHorizontal: 4,
    alignItems: 'center',
  },
  statusButtonActive: {
    backgroundColor: '#FF69B4',
  },
  statusButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  statusButtonTextActive: {
    color: '#fff',
  },
  saveButton: {
    backgroundColor: '#2C3E50',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
