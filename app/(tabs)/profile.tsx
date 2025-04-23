import { View, Text, StyleSheet, Image, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Settings, User, Bell, BookOpen, Award, ChevronRight } from 'lucide-react-native';
import ProgressRing from '../../components/ProgressRing';
import { useAuth } from '../../hooks/useAuth';
import { useProfile } from '../../hooks/useProfile';
import { signOut } from '../../lib/auth';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { profile, loading, error } = useProfile(user?.id);
  
  const menuItems = [
    {
      icon: 'bookOpen',
      title: 'My Learning',
      description: 'Track your progress',
      color: '#3B82F6',
    },
    {
      icon: 'award',
      title: 'Achievements',
      description: `${profile?.total_points || 0} points earned`,
      color: '#8B5CF6',
    },
    {
      icon: 'bell',
      title: 'Notifications',
      description: 'Manage alerts',
      color: '#F59E0B',
    },
    {
      icon: 'settings',
      title: 'Settings',
      description: 'App preferences',
      color: '#6B7280',
    },
  ];
  
  const renderIcon = (iconName: string, color: string) => {
    switch (iconName) {
      case 'bookOpen':
        return <BookOpen size={24} color={color} />;
      case 'award':
        return <Award size={24} color={color} />;
      case 'bell':
        return <Bell size={24} color={color} />;
      case 'settings':
        return <Settings size={24} color={color} />;
      default:
        return <User size={24} color={color} />;
    }
  };
  
  const renderMenuItem = (item: any, index: number) => (
    <Pressable key={index} style={styles.menuItem}>
      <View style={[styles.menuIcon, { backgroundColor: `${item.color}20` }]}>
        {renderIcon(item.icon, item.color)}
      </View>
      <View style={styles.menuContent}>
        <Text style={styles.menuTitle}>{item.title}</Text>
        <Text style={styles.menuDescription}>{item.description}</Text>
      </View>
      <ChevronRight size={20} color="#9CA3AF" />
    </Pressable>
  );

  if (!user) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text>Please sign in to view profile</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text>Loading profile...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>{error.message}</Text>
      </View>
    );
  }
  
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View style={styles.settingsButton}>
          <Settings size={24} color="#6B7280" />
        </View>
      </View>
      
      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileSection}>
          <Image 
            source={{ uri: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg' }}
            style={styles.profileImage}
          />
          <Text style={styles.profileName}>{profile?.bio || user.email}</Text>
          <Text style={styles.profileEmail}>{user.email}</Text>
          
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <ProgressRing progress={26} size={64} strokeWidth={6} />
              <View style={styles.statTextContainer}>
                <Text style={styles.statValue}>26%</Text>
                <Text style={styles.statLabel}>Overall Progress</Text>
              </View>
            </View>
            
            <View style={styles.statDivider} />
            
            <View style={styles.statItem}>
              <View style={styles.streakContainer}>
                <Text style={styles.streakValue}>{profile?.learning_streak || 0}</Text>
              </View>
              <View style={styles.statTextContainer}>
                <Text style={styles.statLabel}>Day Streak</Text>
              </View>
            </View>
          </View>
        </View>
        
        <View style={styles.menuSection}>
          <Text style={styles.menuSectionTitle}>Menu</Text>
          {menuItems.map(renderMenuItem)}
        </View>
        
        <Pressable 
          style={styles.logoutButton}
          onPress={async () => {
            try {
              await signOut();
            } catch (error) {
              console.error('Error signing out:', error);
            }
          }}
        >
          <Text style={styles.logoutText}>Log Out</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  profileName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: 'row',
    width: '100%',
    paddingHorizontal: 24,
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  statDivider: {
    width: 1,
    height: 48,
    backgroundColor: '#E5E7EB',
  },
  statTextContainer: {
    marginLeft: 16,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#3B82F6',
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  streakContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F59E0B20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  streakValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#F59E0B',
  },
  menuSection: {
    paddingHorizontal: 24,
    marginTop: 16,
  },
  menuSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  menuIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  menuDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  logoutButton: {
    marginTop: 24,
    marginHorizontal: 24,
    backgroundColor: '#F3F4F620',
    borderWidth: 1,
    borderColor: '#EF444440',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#EF4444',
  },
  errorText: {
    color: '#EF4444',
    marginBottom: 16,
    textAlign: 'center',
  },
});