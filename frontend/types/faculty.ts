export interface PublicFacultyMember {
  id: string;
  name: string;
  designation: string;
  department: string;
  qualification?: string | null;
  experienceYears: number;
  bio?: string | null;
  imageUrl?: string | null;
  imageAlt: string;
  displayOrder: number;
}

export interface PublicFacultyData {
  faculty: PublicFacultyMember[];
  departments: string[];
}
