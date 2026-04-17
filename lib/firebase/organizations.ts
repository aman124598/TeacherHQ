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
  plan?: string;
}

export interface MarketplaceOrganization {
  id: string;
  name: string;
  city?: string;
  state?: string;
  country?: string;
  memberCount: number;
  plan?: string;
}

export interface Branch {
  id: string;
  organizationId: string;
  name: string;
  address?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  locationRadius?: number; // in meters, for attendance verification
  managerId?: string; // ID of the Branch Admin
  managerName?: string;
  createdAt: any;
  updatedAt: any;
}

export interface Department {
  id: string;
  organizationId: string;
  branchId: string;
  name: string;
  hodId?: string; // ID of the HOD
  hodName?: string;
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

// Get organizations for onboarding marketplace
export const getMarketplaceOrganizations = async (): Promise<MarketplaceOrganization[]> => {
  try {
    const db = getDb();
    const querySnapshot = await getDocs(collection(db, 'organizations'));

    return querySnapshot.docs
      .map((snapshot) => {
        const data = snapshot.data() as Organization;
        return {
          id: data.id || snapshot.id,
          name: data.name,
          city: data.city,
          state: data.state,
          country: data.country,
          memberCount: data.memberCount || 0,
          plan: data.plan || 'starter',
        };
      })
      .filter((org) => !!org.name)
      .sort((a, b) => {
        if (b.memberCount !== a.memberCount) {
          return b.memberCount - a.memberCount;
        }
        return a.name.localeCompare(b.name);
      });
  } catch (error) {
    console.error('Error getting marketplace organizations:', error);
    return [];
  }
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
    const normalizedInviteCode = inviteCode.trim().toUpperCase();

    if (!normalizedInviteCode) {
      return { success: false, error: 'Invite code is required.' };
    }

    const org = await getOrganizationByInviteCode(normalizedInviteCode);
    
    if (!org) {
      return { success: false, error: 'Invalid invite code. Please check and try again.' };
    }

    // --- ENFORCE PLAN LIMITS ---
    const { getPlanDetails } = await import('@/lib/config/plans');
    const plan = org.plan || 'starter';
    const limits = getPlanDetails(plan);
    const currentMemberCount = org.memberCount || 0;

    if (currentMemberCount >= limits.maxMembers) {
      return { 
        success: false, 
        error: `Organization limit reached for ${plan.toUpperCase()} plan (max ${limits.maxMembers} members). Contact admin to upgrade.` 
      };
    }
    // ---------------------------

    const db = getDb();

    // Check if user is already a member
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists() && userDoc.data().organizationId === org.id) {
      return { success: false, error: 'You are already a member of this organization.' };
    }

    if (userDoc.exists() && userDoc.data().organizationId && userDoc.data().organizationId !== org.id) {
      return { success: false, error: 'Please leave your current organization before joining a new one.' };
    }

    // Update user with organization details
    await setDoc(doc(db, 'users', userId), {
      uid: userId,
      email: userEmail || null,
      displayName: userName || null,
      organizationId: org.id,
      organizationRole: 'teacher',
      organizationName: org.name,
      updatedAt: serverTimestamp(),
    }, { merge: true });

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

// Join organization directly by organization ID (used by onboarding marketplace)
export const joinOrganizationById = async (
  userId: string,
  userEmail: string,
  userName: string,
  organizationId: string
): Promise<{ success: boolean; organization?: Organization; error?: string }> => {
  try {
    const org = await getOrganization(organizationId);

    if (!org) {
      return { success: false, error: 'Organization not found.' };
    }

    // --- ENFORCE PLAN LIMITS ---
    const { getPlanDetails } = await import('@/lib/config/plans');
    const plan = org.plan || 'starter';
    const limits = getPlanDetails(plan);
    const currentMemberCount = org.memberCount || 0;

    if (currentMemberCount >= limits.maxMembers) {
      return {
        success: false,
        error: `Organization limit reached for ${plan.toUpperCase()} plan (max ${limits.maxMembers} members). Contact admin to upgrade.`
      };
    }
    // ---------------------------

    const db = getDb();

    // Check if user is already a member
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists() && userDoc.data().organizationId === org.id) {
      return { success: false, error: 'You are already a member of this organization.' };
    }

    if (userDoc.exists() && userDoc.data().organizationId && userDoc.data().organizationId !== org.id) {
      return { success: false, error: 'Please leave your current organization before joining a new one.' };
    }

    // Update user with organization details
    await setDoc(doc(db, 'users', userId), {
      uid: userId,
      email: userEmail || null,
      displayName: userName || null,
      organizationId: org.id,
      organizationRole: 'teacher',
      organizationName: org.name,
      updatedAt: serverTimestamp(),
    }, { merge: true });

    // Increment member count
    await updateDoc(doc(db, 'organizations', org.id), {
      memberCount: (org.memberCount || 1) + 1,
      updatedAt: serverTimestamp(),
    });

    return { success: true, organization: org };
  } catch (error: any) {
    console.error('Error joining organization by id:', error);
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

    // Enforce single-admin-per-organization.
    const adminQuery = query(
      collection(db, 'users'),
      where('organizationId', '==', orgId),
      where('organizationRole', '==', 'admin')
    );
    const adminSnapshot = await getDocs(adminQuery);
    const existingAdmin = adminSnapshot.docs.find((snapshot) => snapshot.id !== userId);

    if (existingAdmin) {
      return false;
    }

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

// Demote admin member to teacher
export const demoteMemberToTeacher = async (orgId: string, userId: string): Promise<boolean> => {
  try {
    const db = getDb();
    const org = await getOrganization(orgId);

    if (!org) return false;

    // Prevent demoting the organization owner admin.
    if (org.adminId === userId) {
      return false;
    }

    await updateDoc(doc(db, 'users', userId), {
      organizationRole: 'teacher',
      updatedAt: serverTimestamp(),
    });

    return true;
  } catch (error) {
    console.error('Error demoting member:', error);
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

// --- Branch Management ---

export const createBranch = async (organizationId: string, data: { name: string; address?: string }) => {
  try {
    const db = getDb();
    const branchRef = doc(collection(db, 'organizations', organizationId, 'branches'));
    const branch: Branch = {
      id: branchRef.id,
      organizationId,
      name: data.name,
      address: data.address || '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    await setDoc(branchRef, branch);
    return { success: true, branch };
  } catch (error) {
    console.error('Error creating branch:', error);
    return { success: false, error };
  }
};

export const getBranches = async (organizationId: string): Promise<Branch[]> => {
  try {
    const db = getDb();
    const q = collection(db, 'organizations', organizationId, 'branches');
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data() as Branch);
  } catch (error) {
    console.error('Error fetching branches:', error);
    return [];
  }
};

export const updateBranch = async (organizationId: string, branchId: string, updates: Partial<Branch>) => {
  try {
    const db = getDb();
    const branchRef = doc(db, 'organizations', organizationId, 'branches', branchId);
    await updateDoc(branchRef, { ...updates, updatedAt: serverTimestamp() });
    return { success: true };
  } catch (error) {
    console.error('Error updating branch:', error);
    return { success: false, error };
  }
};

// --- Department Management ---

export const createDepartment = async (organizationId: string, branchId: string, data: { name: string }) => {
  try {
    const db = getDb();
    const deptRef = doc(collection(db, 'organizations', organizationId, 'branches', branchId, 'departments'));
    const department: Department = {
      id: deptRef.id,
      organizationId,
      branchId,
      name: data.name,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    await setDoc(deptRef, department);
    return { success: true, department };
  } catch (error) {
    console.error('Error creating department:', error);
    return { success: false, error };
  }
};

export const getDepartmentsOnBranch = async (organizationId: string, branchId: string): Promise<Department[]> => {
  try {
    const db = getDb();
    const q = collection(db, 'organizations', organizationId, 'branches', branchId, 'departments');
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data() as Department);
  } catch (error) {
    console.error('Error fetching departments:', error);
    return [];
  }
};

export const getAllDepartmentsForOrg = async (organizationId: string): Promise<Department[]> => {
  try {
    const db = getDb();
    const branches = await getBranches(organizationId);
    let allDepts: Department[] = [];
    
    for (const branch of branches) {
      const depts = await getDepartmentsOnBranch(organizationId, branch.id);
      allDepts = [...allDepts, ...depts];
    }
    
    return allDepts;
  } catch (error) {
    console.error('Error fetching all departments:', error);
    return [];
  }
};

export const updateDepartment = async (organizationId: string, branchId: string, deptId: string, updates: Partial<Department>) => {
  try {
    const db = getDb();
    const deptRef = doc(db, 'organizations', organizationId, 'branches', branchId, 'departments', deptId);
    await updateDoc(deptRef, { ...updates, updatedAt: serverTimestamp() });
    return { success: true };
  } catch (error) {
    console.error('Error updating department:', error);
    return { success: false, error };
  }
};
