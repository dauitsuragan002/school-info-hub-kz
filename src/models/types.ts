
export interface Schedule {
  day: string;
  time: string;
  grade: string;
  subject: string;
  room: string;
  shift: string;
}

export interface Student {
  name: string;
  grade: string;
  birthdate: string;
}

export interface Teacher {
  name: string;
  position: string;
  birthdate: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  username: string | null;
}
