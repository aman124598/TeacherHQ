import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  query, 
  where,
  addDoc,
  deleteDoc,
  Timestamp,
  Firestore
} from 'firebase/firestore';
import { getFirebaseApp } from './config';
import { UserData } from './auth';

// Initialize Firestore - simple approach
let firestoreInstance: Firestore | null = null;

const getDb = (): Firestore => {
  if (!firestoreInstance) {
    firestoreInstance = getFirestore(getFirebaseApp());
  }
  return firestoreInstance;
};

// --- User Management ---

export const getAllTeachers = async (): Promise<UserData[]> => {
  try {
    const db = getDb();
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('role', '==', 'teacher'));
    const snapshot = await getDocs(q);
    console.log('Fetched teachers from Firebase:', snapshot.docs.length);
    return snapshot.docs.map(d => ({
      uid: d.id,
      ...d.data()
    } as UserData));
  } catch (error) {
    console.error('Error fetching teachers:', error);
    return [];
  }
};

export const getAllUsers = async (): Promise<UserData[]> => {
  try {
    const db = getDb();
    const usersRef = collection(db, 'users');
    console.log('Attempting to fetch users from Firebase...');
    const snapshot = await getDocs(usersRef);
    console.log('Fetched users from Firebase:', snapshot.docs.length);
    
    // Log each user for debugging
    snapshot.docs.forEach(d => {
      console.log('User found:', d.id, d.data().email);
    });
    
    return snapshot.docs.map(d => ({
      uid: d.id,
      ...d.data()
    } as UserData));
  } catch (error) {
    console.error('Error fetching all users:', error);
    return [];
  }
};

// Create a user document in Firestore if it doesn't exist
export const createUserIfNotExists = async (userData: UserData): Promise<{ success: boolean; created: boolean }> => {
  try {
    const db = getDb();
    const userRef = doc(db, 'users', userData.uid);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      await setDoc(userRef, {
        ...userData,
        createdAt: Timestamp.now(),
        lastLoginAt: Timestamp.now()
      });
      console.log('Created new user in Firestore:', userData.uid);
    return { success: true, created: true };
    }
    
    // Update last login
    await updateDoc(userRef, { lastLoginAt: Timestamp.now() });
    return { success: true, created: false };
  } catch (error) {
    console.error('Error creating user document:', error);
    return { success: false, created: false };
  }
};

// --- Schedule Management ---

export interface ScheduleData {
  userId: string;
  days: {
    name: string;
    periods: string[];
  }[];
  updatedAt: any;
}

export const getTeacherSchedule = async (userId: string): Promise<ScheduleData | null> => {
  try {
    const db = getDb();
    const docRef = doc(db, 'schedules', userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data() as ScheduleData;
    }
    return null;
  } catch (error) {
    console.error('Error fetching schedule:', error);
    return null;
  }
};

export const updateTeacherSchedule = async (userId: string, scheduleData: any) => {
  try {
    const db = getDb();
    const docRef = doc(db, 'schedules', userId);
    await setDoc(docRef, {
      userId,
      ...scheduleData,
      updatedAt: Timestamp.now()
    }, { merge: true });
    return { success: true };
  } catch (error) {
    console.error('Error updating schedule:', error);
    return { success: false, error };
  }
};

// --- Task/Event Management ---

export interface TaskData {
  id?: string;
  title: string;
  description: string;
  assignedTo: string | 'all';
  dueDate: any;
  createdAt: any;
  type: 'task' | 'event' | 'notice';
  status: 'pending' | 'completed';
}

export const createTask = async (task: Omit<TaskData, 'id' | 'createdAt'>) => {
  try {
    const db = getDb();
    const tasksRef = collection(db, 'tasks');
    await addDoc(tasksRef, {
      ...task,
      createdAt: Timestamp.now(),
      status: 'pending'
    });
    return { success: true };
  } catch (error) {
    console.error('Error creating task:', error);
    return { success: false, error };
  }
};

export const getTasksForUser = async (userId: string): Promise<TaskData[]> => {
  try {
    const db = getDb();
    const tasksRef = collection(db, 'tasks');
    const q = query(tasksRef, where('assignedTo', 'in', [userId, 'all']));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as TaskData));
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return [];
  }
};

// --- Statistics ---

export const getAttendanceStats = async (userId: string) => {
  try {
    const db = getDb();
    const docRef = doc(db, 'attendance', userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data();
    }
    
    return {
      present: 0,
      absent: 0,
      total: 0,
      history: []
    };
  } catch (error) {
    console.error('Error fetching stats:', error);
    return null;
  }
};

// --- Personal Events Management ---

export interface EventData {
  id?: string;
  userId: string;
  date: any;
  title: string;
  description?: string;
  type: "exam" | "meeting" | "holiday" | "other";
  createdAt: any;
}

export const getUserEvents = async (userId: string): Promise<EventData[]> => {
  try {
    const db = getDb();
    const eventsRef = collection(db, 'events');
    const q = query(eventsRef, where('userId', '==', userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as EventData));
  } catch (error) {
    console.error('Error fetching user events:', error);
    return [];
  }
};

export const addUserEvent = async (event: Omit<EventData, 'id' | 'createdAt'>) => {
  try {
    const db = getDb();
    const eventsRef = collection(db, 'events');
    const docRef = await addDoc(eventsRef, {
      ...event,
      createdAt: Timestamp.now()
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error adding event:', error);
    return { success: false, error };
  }
};

export const deleteUserEvent = async (eventId: string) => {
  try {
    const db = getDb();
    const docRef = doc(db, 'events', eventId);
    await deleteDoc(docRef);
    return { success: true };
  } catch (error) {
    console.error('Error deleting event:', error);
    return { success: false, error };
  }
};

// --- Personal Todos Management ---

export interface TodoData {
  id?: string;
  userId: string;
  text: string;
  completed: boolean;
  createdAt: any;
}

export const getUserTodos = async (userId: string): Promise<TodoData[]> => {
  try {
    const db = getDb();
    const todosRef = collection(db, 'todos');
    const q = query(todosRef, where('userId', '==', userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as TodoData));
  } catch (error) {
    console.error('Error fetching todos:', error);
    return [];
  }
};

export const addUserTodo = async (todo: Omit<TodoData, 'id' | 'createdAt'>) => {
  try {
    const db = getDb();
    const todosRef = collection(db, 'todos');
    const docRef = await addDoc(todosRef, {
      ...todo,
      createdAt: Timestamp.now()
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error adding todo:', error);
    return { success: false, error };
  }
};

export const updateUserTodo = async (todoId: string, data: Partial<TodoData>) => {
  try {
    const db = getDb();
    const docRef = doc(db, 'todos', todoId);
    await updateDoc(docRef, data);
    return { success: true };
  } catch (error) {
    console.error('Error updating todo:', error);
    return { success: false, error };
  }
};

export const deleteUserTodo = async (todoId: string) => {
  try {
    const db = getDb();
    const docRef = doc(db, 'todos', todoId);
    await deleteDoc(docRef);
    return { success: true };
  } catch (error) {
    console.error('Error deleting todo:', error);
    return { success: false, error };
  }
};

// --- Admin User Management ---

export const updateUser = async (userId: string, data: Partial<UserData>) => {
  try {
    const db = getDb();
    const docRef = doc(db, 'users', userId);
    await updateDoc(docRef, data);
    return { success: true };
  } catch (error) {
    console.error('Error updating user:', error);
    return { success: false, error };
  }
};

export const deleteUser = async (userId: string) => {
  try {
    const db = getDb();
    // Delete user document
    const userRef = doc(db, 'users', userId);
    await deleteDoc(userRef);
    
    // Also delete related data
    const scheduleRef = doc(db, 'schedules', userId);
    await deleteDoc(scheduleRef).catch(() => {});
    
    const attendanceDocRef = doc(db, 'attendance', userId);
    await deleteDoc(attendanceDocRef).catch(() => {});
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting user:', error);
    return { success: false, error };
  }
};

export const getUserById = async (userId: string): Promise<UserData | null> => {
  try {
    const db = getDb();
    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { uid: docSnap.id, ...docSnap.data() } as UserData;
    }
    return null;
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
};

// --- Admin Task Management ---

export const getAllTasks = async (): Promise<TaskData[]> => {
  try {
    const db = getDb();
    const tasksRef = collection(db, 'tasks');
    const snapshot = await getDocs(tasksRef);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as TaskData));
  } catch (error) {
    console.error('Error fetching all tasks:', error);
    return [];
  }
};

export const updateTask = async (taskId: string, data: Partial<TaskData>) => {
  try {
    const db = getDb();
    const docRef = doc(db, 'tasks', taskId);
    await updateDoc(docRef, data);
    return { success: true };
  } catch (error) {
    console.error('Error updating task:', error);
    return { success: false, error };
  }
};

export const deleteTask = async (taskId: string) => {
  try {
    const db = getDb();
    const docRef = doc(db, 'tasks', taskId);
    await deleteDoc(docRef);
    return { success: true };
  } catch (error) {
    console.error('Error deleting task:', error);
    return { success: false, error };
  }
};

// --- Attendance Management ---

export const updateAttendance = async (userId: string, attendanceData: any) => {
  try {
    const db = getDb();
    const docRef = doc(db, 'attendance', userId);
    await setDoc(docRef, {
      userId,
      ...attendanceData,
      updatedAt: Timestamp.now()
    }, { merge: true });
    return { success: true };
  } catch (error) {
    console.error('Error updating attendance:', error);
    return { success: false, error };
  }
};

export const getAllAttendance = async () => {
  try {
    const db = getDb();
    const attendanceRef = collection(db, 'attendance');
    const snapshot = await getDocs(attendanceRef);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (error) {
    console.error('Error fetching all attendance:', error);
    return [];
  }
};
