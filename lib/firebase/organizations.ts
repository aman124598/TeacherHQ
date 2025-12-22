import { getFirestore, collection, doc, setDoc, getDoc, getDocs, updateDoc, deleteDoc, query, where, serverTimestamp, arrayUnion, arrayRemove } from 'firebase/firestore';
import { getFirebaseApp } from './config';

const getDb = () => getFirestore(getFirebaseApp());

// Organization interface
export interface Organization {
  id: string;
  name: string;
  slug: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  locationRadius?: number; // in meters, for attendance verification
  adminId: string;
  adminEmail: string;
  inviteCode: string;
  memberCount: number;
  settings?: {
    attendanceEnabled: boolean;
    locationVerification: boolean;
    workingHours?: {
      start: string;
      end: string;
    };
  };
  createdAt: any;
  updatedAt: any;
}

// Generate a unique invite code
export const generateInviteCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// Generate a URL-friendly slug from organization name
export const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    + '-' + Math.random().toString(36).substring(2, 6);
};

// Create a new organization
export const createOrganization = async (
  adminId: string,
  adminEmail: string,
  orgData: {
    name: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    location?: { latitude: number; longitude: number };
    locationRadius?: number;
  }
): Promise<Organization> => {
  const db = getDb();
  const orgId = doc(collection(db, 'organizations')).id;
  const inviteCode = generateInviteCode();
  const slug = generateSlug(orgData.name);

  // Build organization object, only including defined values
  const organization: Organization = {
    id: orgId,
    name: orgData.name,
    slug,
    address: orgData.address || '',
    city: orgData.city || '',
    state: orgData.state || '',
    country: orgData.country || '',
    locationRadius: orgData.locationRadius || 700,
    adminId,
    adminEmail,
    inviteCode,
    memberCount: 1,
    settings: {
      attendanceEnabled: true,
      locationVerification: true,
      workingHours: {
        start: '09:00',
        end: '17:00',
      },
    },
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  // Only add location if it's defined (Firestore doesn't accept undefined values)
  if (orgData.location) {
    organization.location = orgData.location;
  }

  await setDoc(doc(db, 'organizations', orgId), organization);

  // Update user to be admin of this organization
  await updateDoc(doc(db, 'users', adminId), {
    organizationId: orgId,
    organizationRole: 'admin',
    organizationName: orgData.name,
    updatedAt: serverTimestamp(),
  });

  return organization;
};

// Get organization by ID
export const getOrganization = async (orgId: string): Promise<Organization | null> => {
  const db = getDb();
  const orgDoc = await getDoc(doc(db, 'organizations', orgId));
  
  if (orgDoc.exists()) {
    return orgDoc.data() as Organization;
  }
  return null;
};

// Get organization by invite code
export const getOrganizationByInviteCode = async (inviteCode: string): Promise<Organization | null> => {
  const db = getDb();
  const q = query(collection(db, 'organizations'), where('inviteCode', '==', inviteCode.toUpperCase()));
  const querySnapshot = await getDocs(q);
  
  if (!querySnapshot.empty) {
    return querySnapshot.docs[0].data() as Organization;
  }
  return null;
};

// Join organization with invite code
export const joinOrganization = async (
  userId: string,
  userEmail: string,
  userName: string,
  inviteCode: string
): Promise<{ success: boolean; organization?: Organization; error?: string }> => {
  try {
    const org = await getOrganizationByInviteCode(inviteCode);
    
    if (!org) {
      return { success: false, error: 'Invalid invite code. Please check and try again.' };
    }

    const db = getDb();

    // Check if user is already a member
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists() && userDoc.data().organizationId === org.id) {
      return { success: false, error: 'You are already a member of this organization.' };
    }

    // Update user with organization details
    await updateDoc(doc(db, 'users', userId), {
      organizationId: org.id,
      organizationRole: 'teacher',
      organizationName: org.name,
      updatedAt: serverTimestamp(),
    });

    // Increment member count
    await updateDoc(doc(db, 'organizations', org.id), {
      memberCount: (org.memberCount || 1) + 1,
      updatedAt: serverTimestamp(),
    });

    return { success: true, organization: org };
  } catch (error: any) {
    console.error('Error joining organization:', error);
    return { success: false, error: 'Failed to join organization. Please try again.' };
  }
};

// Update organization details
export const updateOrganization = async (
  orgId: string,
  updates: Partial<Organization>
): Promise<boolean> => {
  try {
    const db = getDb();
    await updateDoc(doc(db, 'organizations', orgId), {
      ...updates,
      updatedAt: serverTimestamp(),
    });
    return true;
  } catch (error) {
    console.error('Error updating organization:', error);
    return false;
  }
};

// Regenerate invite code
export const regenerateInviteCode = async (orgId: string): Promise<string | null> => {
  try {
    const db = getDb();
    const newCode = generateInviteCode();
    await updateDoc(doc(db, 'organizations', orgId), {
      inviteCode: newCode,
      updatedAt: serverTimestamp(),
    });
    return newCode;
  } catch (error) {
    console.error('Error regenerating invite code:', error);
    return null;
  }
};

// Get all members of an organization
export const getOrganizationMembers = async (orgId: string): Promise<any[]> => {
  try {
    const db = getDb();
    const q = query(collection(db, 'users'), where('organizationId', '==', orgId));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error getting organization members:', error);
    return [];
  }
};

// Remove member from organization
export const removeMemberFromOrganization = async (
  orgId: string,
  userId: string
): Promise<boolean> => {
  try {
    const db = getDb();
    
    // Get org to check current member count
    const org = await getOrganization(orgId);
    if (!org) return false;

    // Update user to remove organization
    await updateDoc(doc(db, 'users', userId), {
      organizationId: null,
      organizationRole: null,
      organizationName: null,
      updatedAt: serverTimestamp(),
    });

    // Decrement member count
    await updateDoc(doc(db, 'organizations', orgId), {
      memberCount: Math.max((org.memberCount || 1) - 1, 0),
      updatedAt: serverTimestamp(),
    });

    return true;
  } catch (error) {
    console.error('Error removing member:', error);
    return false;
  }
};

// Promote member to admin
export const promoteMemberToAdmin = async (orgId: string, userId: string): Promise<boolean> => {
  try {
    const db = getDb();
    await updateDoc(doc(db, 'users', userId), {
      organizationRole: 'admin',
      updatedAt: serverTimestamp(),
    });
    return true;
  } catch (error) {
    console.error('Error promoting member:', error);
    return false;
  }
};

// Check if user has organization
export const userHasOrganization = async (userId: string): Promise<{ hasOrg: boolean; orgId?: string; role?: string }> => {
  try {
    const db = getDb();
    const userDoc = await getDoc(doc(db, 'users', userId));
    
    if (userDoc.exists()) {
      const data = userDoc.data();
      if (data.organizationId) {
        return {
          hasOrg: true,
          orgId: data.organizationId,
          role: data.organizationRole,
        };
      }
    }
    return { hasOrg: false };
  } catch (error) {
    console.error('Error checking user organization:', error);
    return { hasOrg: false };
  }
};
